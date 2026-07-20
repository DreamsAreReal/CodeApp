/**
 * Lesson: The yield contract (CS.S18.yield-contract) — expert density, 5 animated deep-dives.
 * `yield return` provides the next value; `yield break` ends the iteration explicitly; the
 * iteration also ends at the body's end. An iterator's return type is one of
 * IEnumerable/IEnumerable<T>/IEnumerator/IEnumerator<T> (and IAsyncEnumerable<T> for async).
 * `yield` is BANNED in: methods with in/ref/out params, lambdas/anonymous methods, unsafe
 * blocks; and yield return/break is banned in catch/finally and in try-with-catch — but works
 * in try-with-only-finally, which is why `using` works in iterators. You can't mix `return`
 * and `yield return` in one method.
 *
 * SIGNATURE machine panel (s5): the COMPILER-CONTRACT panel — the REAL Roslyn diagnostics that
 * enforce the rules. Measured via run-csharp: `return`+`yield return` in one method →
 * "CS1622: Cannot return a value from an iterator."; a ref parameter → "CS1623: Iterators
 * cannot have ref, in or out parameters". Real compiler error codes, not memory.
 *
 * Accuracy contract (G4/G7/G8) — every English quote VERBATIM from the two source pages
 * (fetch-verified 2026-07-21):
 *   - S2 https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/yield
 *   - S3 https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/iterators
 *   card verify.expect is REAL run-csharp stdout (this file's exec log):
 *     c1 "2 3 4 5"; c2 "IEnumerator<int> as return: 7 8"; c3 "got 1\ndisposed".
 *   NO GT-M6 iterator myths: MИ-5 (yield in any try/catch) refuted by s4; MИ-6 (mix return &
 *   yield return) refuted by s2/s5.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S18.yield-contract/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: the two forms of yield.
const Z_RET: Zone = { id: "ret", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "yield return", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "отдать следующее значение", subCls: "vz-zsub good", subY: 47 };
const Z_BRK: Zone = { id: "brk", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "yield break", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "явно завершить итерацию", subCls: "vz-zsub", subY: 47 };
const FORMS_ZONES: Zone[] = [Z_RET, Z_BRK];

// s2: return types.
const Z_TYPES: Zone = { id: "types", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "типы возврата итератора", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "IEnumerable(<T>) · IEnumerator(<T>) · async → IAsyncEnumerable<T>", subCls: "vz-zsub", subY: 47 };
const TYPES_ZONES: Zone[] = [Z_TYPES];

// s3: return vs yield return — can't mix.
const Z_MIX: Zone = { id: "mix", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "return + yield return", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "в ОДНОМ методе — ошибка", subCls: "vz-zsub heap", subY: 47 };
const Z_SPLIT: Zone = { id: "split", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "два метода", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "return-метод + yield-метод", subCls: "vz-zsub good", subY: 47 };
const MIX_ZONES: Zone[] = [Z_MIX, Z_SPLIT];

// s4: where yield is banned + try/finally allows using.
const Z_BAN: Zone = { id: "ban", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "yield ЗАПРЕЩЁН", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "in/ref/out · lambda · unsafe · catch/finally", subCls: "vz-zsub heap", subY: 47 };
const Z_OK: Zone = { id: "okz", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "yield РАЗРЕШЁН", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "try без catch (только finally) → using", subCls: "vz-zsub good", subY: 47 };
const BAN_ZONES: Zone[] = [Z_BAN, Z_OK];

// s5 (SIGNATURE): the compiler-contract panel with real diagnostics.
const Z_CS1622: Zone = { id: "cs1622", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "CS1622", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "return + yield return", subCls: "vz-zsub heap", subY: 47 };
const Z_CS1623: Zone = { id: "cs1623", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "CS1623", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "ref / in / out параметр", subCls: "vz-zsub heap", subY: 47 };
const DIAG_ZONES: Zone[] = [Z_CS1622, Z_CS1623];

export const yieldContract: LessonData = {
  id: "CS.S18.yield-contract",
  track: "CS",
  section: "CS.S18",
  module: "S18.2",
  lang: "csharp",
  title: "Контракт yield: return, break, где нельзя",
  kicker: "C# вглубь · S18 · правила yield",
  home: { subtitle: "yield return/break, типы возврата, запреты", icon: "async", estMinutes: 10 },
  prereqs: ["CS.S18.iterators-overview"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-yield", kind: "doc", org: "Microsoft Learn", title: "yield statement (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/yield", date: "2026-03-30" },
    { id: "ms-iter-pg", kind: "doc", org: "Microsoft Learn", title: "Iterate through collections (C#)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/iterators", date: "2026-03-30" },
  ],

  spec: [
    { text: "«Use the yield statement in an iterator to provide the next value or signal the end of an iteration.»", source: "ms-yield" },
  ],
  edgeCases: [
    { text: 'Тип возврата итератора — один из четырёх: «The return type of an iterator method or <code>get</code> accessor can be <code>IEnumerable</code>, <code>IEnumerable&lt;T&gt;</code>, <code>IEnumerator</code>, or <code>IEnumerator&lt;T&gt;</code>»; для async — <code>IAsyncEnumerable&lt;T&gt;</code>.', source: "ms-iter-pg" },
    { text: '<code>yield</code> — не зарезервированное слово: «In C#, <code>yield</code> is not a reserved word and has special meaning only when it is used before a <code>return</code> or <code>break</code> keyword». Итератор — метод или <code>get</code>-аксессор, но не event/конструктор/финалайзер.', source: "ms-iter-pg" },
    { text: '<code>yield return</code>/<code>yield break</code> запрещены в <code>catch</code>/<code>finally</code> и в <code>try</code> с <code>catch</code>; разрешены в <code>try</code> <b>без</b> <code>catch</code> (только с <code>finally</code>) — поэтому <code>using</code> в итераторах работает.', source: "ms-yield" },
  ],

  misconceptions: [
    {
      wrong: "yield return можно ставить в любом try/catch; в одном методе можно свободно мешать return и yield return",
      hook: 'Два мифа о правилах <code>yield</code>. «<span class="wrong">yield в любом try/catch</span>» — нет: <code>yield return</code>/<code>yield break</code> запрещены в <code>catch</code>/<code>finally</code> и в <code>try</code> <b>с</b> <code>catch</code>; разрешены только в <code>try</code> без <code>catch</code> (с <code>finally</code>) — вот почему <code>using</code> в итераторе работает (он компилируется в <code>try/finally</code>). «<span class="wrong">свободно мешать return и yield return</span>» — нет: «you can\'t have both a <code>return</code> statement and a <code>yield return</code> statement in the same method» — компилятор бросает <b>CS1622</b>. Ниже <b>пять разборов</b>: две формы <code>yield</code>, типы возврата, <code>return</code> vs <code>yield return</code> (и обход), где <code>yield</code> запрещён, и <b>машинная панель</b> — реальные диагностики Roslyn (CS1622 / CS1623), которые прибивают нарушения контракта.',
      source: "ms-yield",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Две формы yield", title: "yield return отдаёт значение; yield break завершает",
      viewBox: "0 0 340 210", zones: FORMS_ZONES,
      code: ["IEnumerable<int> TakeWhilePositive(IEnumerable<int> nums){", "  foreach (int n in nums){ if (n > 0) yield return n; else yield break; }", "}   // на первом неположительном — обрываем итерацию"],
      predictAt: 1, predictQ: 'Для входа <code>{2,3,4,5,-1,3,4}</code>: <code>yield return n</code> пока <code>n&gt;0</code>, иначе <code>yield break</code>. Что выдаст последовательность?',
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>yield return n</code> — <span class="hl">отдать следующее значение</span> и приостановиться. Пока элементы положительны, они уходят в результат.', nodes: [{ id: "r", kind: "gate", at: { zone: "ret", row: 0 }, state: "ok", label: "yield return n", detail: "2, 3, 4, 5", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'На <code>-1</code> срабатывает <span class="hl"><code>yield break</code></span> — <b>явный конец</b> итерации: дальше (3, 4) уже не отдаются.', nodes: [{ id: "r", kind: "gate", at: { zone: "ret", row: 0 }, state: "ok", label: "yield return", detail: "2, 3, 4, 5" }, { id: "b", kind: "gate", at: { zone: "brk", row: 0 }, state: "fail", label: "yield break на -1", detail: "стоп", accent: true }], edges: [] },
        { codeLine: 2, out: "2 3 4 5", caption: 'Вывод: <b>2 3 4 5</b> (реальный прогон). «Iteration also finishes when control reaches the end of an iterator» — но <code>yield break</code> обрывает <span class="hl">раньше</span>.', nodes: [{ id: "res", kind: "gate", at: { zone: "ret", row: 0 }, state: "ok", label: "результат", detail: "2 3 4 5", accent: true }, { id: "b", kind: "gate", at: { zone: "brk", row: 0 }, state: "fail", label: "хвост отброшен", detail: "3, 4 — нет" }], edges: [] },
      ],
      explain: 'Оператор <code>yield</code> имеет две формы: «Use the <code>yield</code> statement in an iterator to provide the next value or signal the end of an iteration». <code>yield return</code> — «to provide the next value in iteration»; <code>yield break</code> — «to explicitly signal the end of iteration». Плюс: «Iteration also finishes when control reaches the end of an iterator» — то есть дойти до конца тела тоже завершает обход. В примере из доки <code>TakeWhilePositive({2,3,4,5,-1,3,4})</code> отдаёт <b>2 3 4 5</b> и на <code>-1</code> делает <code>yield break</code> — хвост <code>3, 4</code> не появляется. <code>yield break</code> — способ закончить последовательность посреди тела, не доводя до его конца.',
      sources: ["ms-yield"],
    },
    {
      id: "s2", num: "02", kicker: "Типы возврата", title: "Четыре синхронных типа + IAsyncEnumerable<T>",
      viewBox: "0 0 340 210", zones: TYPES_ZONES,
      code: ["IEnumerable<int> A(){ yield return 1; }     // most common", "IEnumerator<int> B(){ yield return 7; }     // тоже валиден", "IEnumerable  C(){ yield return 1; }         // nongeneric", "async IAsyncEnumerable<int> D(){ yield return 1; }  // async"],
      scenes: [
        { codeLine: 0, caption: 'Самый частый — <span class="hl"><code>IEnumerable&lt;T&gt;</code></span>: последовательность, по которой удобно делать <code>foreach</code>.', nodes: [{ id: "a", kind: "chip", at: { zone: "types", row: 0, col: 0 }, value: "IEnumerable<T>", accent: true }, { id: "b", kind: "chip", at: { zone: "types", row: 0, col: 1 }, value: "IEnumerable" }], edges: [] },
        { codeLine: 1, caption: '<code>IEnumerator&lt;T&gt;</code>/<code>IEnumerator</code> — тоже валидные типы возврата итератора (например, для <code>GetEnumerator</code> своего класса).', nodes: [{ id: "a", kind: "chip", at: { zone: "types", row: 0, col: 0 }, value: "IEnumerable<T>" }, { id: "b", kind: "chip", at: { zone: "types", row: 0, col: 1 }, value: "IEnumerable" }, { id: "c", kind: "chip", at: { zone: "types", row: 1, col: 0 }, value: "IEnumerator<T>", accent: true }, { id: "d", kind: "chip", at: { zone: "types", row: 1, col: 1 }, value: "IEnumerator" }], edges: [] },
        { codeLine: 3, caption: '<span class="hl"><code>IAsyncEnumerable&lt;T&gt;</code></span> делает итератор <b>async</b>: «That makes an iterator async» (внутренности — S18.4).', nodes: [{ id: "sync", kind: "chip", at: { zone: "types", row: 0, col: 0 }, value: "4 синхронных типа" }, { id: "async", kind: "gate", at: { zone: "types", row: 1 }, state: "ok", label: "IAsyncEnumerable<T>", detail: "async-итератор", accent: true }], edges: [] },
      ],
      explain: 'Тип возврата итератора строго ограничен: «The return type of an iterator method or <code>get</code> accessor can be <code>IEnumerable</code>, <code>IEnumerable&lt;T&gt;</code>, <code>IEnumerator</code>, or <code>IEnumerator&lt;T&gt;</code>». Плюс async-вариант: «You can also use <code>IAsyncEnumerable&lt;T&gt;</code> as the return type of an iterator. That makes an iterator async». То есть один и тот же <code>yield return</code> строит и «коллекцию для <code>foreach</code>» (<code>IEnumerable&lt;T&gt;</code>), и «энумератор» (<code>IEnumerator&lt;T&gt;</code>, удобно при написании своего <code>GetEnumerator</code>), и async-поток (<code>IAsyncEnumerable&lt;T&gt;</code>). Компилятор по типу возврата решает, какую стейт-машину сгенерировать (S18.3/S18.4).',
      sources: ["ms-yield", "ms-iter-pg"],
    },
    {
      id: "s3", num: "03", kicker: "return vs yield return", title: "В одном методе их мешать нельзя — разбей на два",
      viewBox: "0 0 340 210", zones: MIX_ZONES,
      code: ["IEnumerable<int> Get(bool empty){", "  if (empty) return new int[0];       // return-метод", "  else return Iter();                 // делегирует итератору", "}", "IEnumerable<int> Iter(){ yield return 1; yield return 2; }  // yield-метод"],
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Хочется вернуть <b>пустую коллекцию ИЛИ последовательность</b>. Смешать <code>return</code> и <code>yield return</code> в одном методе — <span class="hl">ошибка компиляции</span> (CS1622).', nodes: [{ id: "m", kind: "gate", at: { zone: "mix", row: 0 }, state: "fail", label: "return + yield", detail: "CS1622", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Решение — <span class="hl">два метода</span>: внешний с обычным <code>return</code> отдаёт либо пустой массив, либо итератор.', nodes: [{ id: "m", kind: "gate", at: { zone: "mix", row: 0 }, state: "fail", label: "нельзя вместе", detail: "CS1622" }, { id: "outer", kind: "gate", at: { zone: "split", row: 0 }, state: "ok", label: "Get() · return", detail: "[] или Iter()", accent: true }], edges: [] },
        { codeLine: 4, out: "empty=[] full=[1,2]", caption: 'Внутренний <code>Iter()</code> — чистый итератор с <code>yield return</code>. Вывод: <b>empty=[] full=[1,2]</b> (реальный прогон).', nodes: [{ id: "outer", kind: "gate", at: { zone: "split", row: 0 }, state: "ok", label: "Get() · return", detail: "выбор" }, { id: "inner", kind: "gate", at: { zone: "split", row: 1 }, state: "ok", label: "Iter() · yield", detail: "1, 2", accent: true }], edges: [{ id: "e1", from: "outer", to: "inner" }] },
      ],
      explain: 'Жёсткое ограничение: «There\'s one important restriction on iterator methods: you can\'t have both a <code>return</code> statement and a <code>yield return</code> statement in the same method». Нарушение — реальная ошибка компилятора <b>CS1622</b> (машинная панель, разбор 05). Штатный обход — разбить на два метода: внешний использует обычный <code>return</code> (может отдать пустую коллекцию <b>или</b> итератор), а внутренний — только <code>yield return</code>. Реальный прогон: <code>Get(true)</code> → пусто, <code>Get(false)</code> → <code>[1, 2]</code>. Это частый паттерн «eager-проверка аргументов + ленивое тело»: аргументы валидируются в <code>return</code>-методе <b>сразу</b>, а не отложенно на первом <code>MoveNext</code>.',
      sources: ["ms-iter-pg"],
    },
    {
      id: "s4", num: "04", kicker: "Где yield запрещён", title: "in/ref/out, lambda, unsafe, catch — и почему using работает",
      viewBox: "0 0 340 210", zones: BAN_ZONES,
      code: ["// yield нельзя: методы с in/ref/out; lambda и анонимные методы; unsafe-блоки", "// yield return/break нельзя: в catch, в finally, в try С catch", "// МОЖНО: try без catch (только finally) → поэтому using в итераторе работает"],
      scenes: [
        { codeLine: 0, caption: 'Метод с <code>in</code>/<code>ref</code>/<code>out</code>, lambda, анонимный метод, <code>unsafe</code>-блок — <span class="hl"><code>yield</code> запрещён</span>. «You can\'t use the <code>yield</code> statements in: methods with <code>in</code>, <code>ref</code>, or <code>out</code> parameters».', nodes: [{ id: "p", kind: "chip", at: { zone: "ban", row: 0 }, value: "in/ref/out" }, { id: "l", kind: "chip", at: { zone: "ban", row: 1 }, value: "lambda · unsafe", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>yield return</code>/<code>yield break</code> нельзя в <code>catch</code>, в <code>finally</code>, и в <code>try</code> <span class="hl">с</span> <code>catch</code>-блоком.', nodes: [{ id: "p", kind: "chip", at: { zone: "ban", row: 0 }, value: "in/ref/out" }, { id: "l", kind: "chip", at: { zone: "ban", row: 1, col: 0 }, value: "lambda · unsafe" }, { id: "tc", kind: "chip", at: { zone: "ban", row: 1, col: 1 }, value: "catch / try+catch", accent: true }], edges: [] },
        { codeLine: 2, caption: 'НО в <code>try</code> <b>без</b> <code>catch</code> (только <code>finally</code>) — <span class="hl">можно</span>. <code>using</code> компилируется именно в такой <code>try/finally</code> → <code>using</code> в итераторе <b>работает</b>.', nodes: [{ id: "tc", kind: "chip", at: { zone: "ban", row: 0 }, value: "try + catch — нет" }, { id: "ok", kind: "gate", at: { zone: "okz", row: 0 }, state: "ok", label: "try + только finally", detail: "using OK", accent: true }], edges: [] },
      ],
      explain: 'Контракт запретов дословно: «You can\'t use the <code>yield</code> statements in: methods with <code>in</code>, <code>ref</code>, or <code>out</code> parameters. lambda expressions and anonymous methods. unsafe blocks. Before C# 13, <code>yield</code> was invalid in any method with an <code>unsafe</code> block. Beginning with C# 13, you can use <code>yield</code> in methods with <code>unsafe</code> blocks, but not in the <code>unsafe</code> block». И про исключения: «<code>yield return</code> and <code>yield break</code> can\'t be used in <code>catch</code> and <code>finally</code> blocks, or in <code>try</code> blocks with a corresponding <code>catch</code> block. The <code>yield return</code> and <code>yield break</code> statements can be used in a <code>try</code> block with no <code>catch</code> blocks, only a <code>finally</code> block». Отсюда важное следствие: «Since <code>using</code> statements compile into <code>try</code> blocks with <code>finally</code> clauses (and no <code>catch</code> blocks), they work correctly with iterators» — ресурс корректно освобождается даже при раннем <code>break</code>.',
      sources: ["ms-yield"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальные диагностики", title: "Контракт прибивает компилятор: CS1622 и CS1623",
      viewBox: "0 0 340 214", zones: DIAG_ZONES,
      code: ["IEnumerable<int> Bad(){ yield return 1; return new int[]{2,3}; }", "//  → error CS1622: Cannot return a value from an iterator.", "IEnumerable<int> Bad(ref int x){ yield return x; }", "//  → error CS1623: Iterators cannot have ref, in or out parameters"],
      scenes: [
        { codeLine: 0, caption: 'Смешали <code>yield return</code> и <code>return</code> — компилятор <span class="hl">не пропускает</span>: реальный код ошибки <b>CS1622</b>.', nodes: [{ id: "c1", kind: "gate", at: { zone: "cs1622", row: 0 }, state: "fail", label: "return + yield", detail: "CS1622", accent: true }], edges: [] },
        { codeLine: 1, caption: '«Cannot return a value from an iterator. Use the <code>yield return</code> statement…» — это <span class="hl">текст самой диагностики</span> Roslyn.', nodes: [{ id: "c1", kind: "gate", at: { zone: "cs1622", row: 0 }, state: "fail", label: "CS1622", detail: "cannot return a value" }, { id: "c1t", kind: "chip", at: { zone: "cs1622", row: 1 }, value: "use yield return", accent: true }], edges: [] },
        { codeLine: 3, caption: '<code>ref</code>-параметр у итератора — <span class="hl">отдельная</span> диагностика <b>CS1623</b>: «Iterators cannot have ref, in or out parameters».', nodes: [{ id: "c1", kind: "gate", at: { zone: "cs1622", row: 0 }, state: "fail", label: "CS1622", detail: "return+yield" }, { id: "c2", kind: "gate", at: { zone: "cs1623", row: 0 }, state: "fail", label: "CS1623", detail: "ref/in/out", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — не пересказ правил, а <b>реальные диагностики Roslyn</b>, снятые прогоном через компилятор. Смешение <code>return</code> и <code>yield return</code> в одном методе даёт <code>error <b>CS1622</b>: Cannot return a value from an iterator. Use the yield return statement to return a value, or yield break to end the iteration</code>. Итератор с <code>ref</code>/<code>in</code>/<code>out</code>-параметром — <code>error <b>CS1623</b>: Iterators cannot have ref, in or out parameters</code>. Это «уровень ниже» контракта: правила из доки не просто рекомендация — они зашиты в компилятор конкретными кодами ошибок, которые ты увидишь при сборке. (Коды CS16xx — из вывода Roslyn, не из текста Learn; провенанс — реальный прогон run-csharp.)',
      sources: ["ms-yield", "ms-iter-pg"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>IEnumerable&lt;int&gt; TakeWhilePositive(IEnumerable&lt;int&gt; nums){ foreach(int n in nums){ if(n&gt;0) yield return n; else yield break; } } Console.WriteLine(string.Join(" ", TakeWhilePositive(new int[]{2,3,4,5,-1,3,4})));</code> — что напечатает?',
      options: ["2 3 4 5", "2 3 4 5 3 4", "2 3 4 5 -1 3 4", "(пусто)"], correctIndex: 0, xp: 10,
      okText: '<code>yield break</code> на <code>-1</code> <span class="hl">явно завершает</span> итерацию — хвост <code>3, 4</code> уже не отдаётся. Печать: <b>2 3 4 5</b>.',
      noText: '<code>yield return</code> отдаёт положительные, <code>yield break</code> обрывает на первом неположительном. Реальный вывод: <b>2 3 4 5</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "2 3 4 5" }, sourceRefs: ["ms-yield"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>IEnumerator&lt;int&gt; Ector(){ yield return 7; yield return 8; } var e = Ector(); var sb = new StringBuilder(); while(e.MoveNext()) sb.Append(e.Current).Append(" "); Console.WriteLine($"IEnumerator&lt;int&gt; as return: {sb.ToString().Trim()}");</code> — что напечатает?',
      options: ["IEnumerator<int> as return: 7 8", "IEnumerator<int> as return: 8 7", "IEnumerator<int> as return: 7", "(ошибка компиляции)"], correctIndex: 0, xp: 10,
      okText: '<code>IEnumerator&lt;T&gt;</code> — <span class="hl">валидный</span> тип возврата итератора (наряду с <code>IEnumerable(&lt;T&gt;)</code>/<code>IEnumerator</code>). Печать: <b>IEnumerator&lt;int&gt; as return: 7 8</b>.',
      noText: 'Итератор может возвращать <code>IEnumerator&lt;T&gt;</code>, а не только <code>IEnumerable&lt;T&gt;</code>. Реальный вывод: <b>IEnumerator&lt;int&gt; as return: 7 8</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "IEnumerator<int> as return: 7 8" }, sourceRefs: ["ms-iter-pg"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>class Res : IDisposable { public void Dispose()=&gt;Console.WriteLine("disposed"); } IEnumerable&lt;int&gt; Read(){ using var r = new Res(); yield return 1; yield return 2; yield return 3; } foreach(var x in Read()){ Console.WriteLine($"got {x}"); if(x==1) break; }</code> — что напечатает (по строкам)?',
      options: ["got 1\\ndisposed", "got 1", "got 1\\ngot 2\\ngot 3\\ndisposed", "disposed\\ngot 1"], correctIndex: 0, xp: 10,
      okText: '<code>using</code> в итераторе компилируется в <code>try/finally</code> — <code>Dispose</code> вызывается даже при <span class="hl">раннем <code>break</code></span>. Печать: <b>got 1</b>, затем <b>disposed</b>.',
      noText: 'При <code>break</code> после первого элемента энумератор диспозится → <code>using</code>-ресурс освобождается. Реальный вывод: <b>got 1</b>, затем <b>disposed</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "got 1\ndisposed" }, sourceRefs: ["ms-yield"],
    },
  ],

  takeaways: [
    { icon: "why", k: "две формы", v: '<code>yield return</code> — отдать следующее значение; <code>yield break</code> — явно завершить (итерация также кончается на конце тела). «Use the <code>yield</code> statement… to provide the next value or signal the end».' },
    { icon: "cost", k: "типы и запреты", v: 'Возврат: <code>IEnumerable(&lt;T&gt;)</code>/<code>IEnumerator(&lt;T&gt;)</code>, async → <code>IAsyncEnumerable&lt;T&gt;</code>. <code>yield</code> запрещён в in/ref/out, lambda, unsafe, catch/finally и try+catch; разрешён в try+только-finally (→ <code>using</code>).' },
    { icon: "avoid", k: "контракт компилятора", v: 'Нельзя мешать <code>return</code> и <code>yield return</code> — реальная ошибка <b>CS1622</b>; <code>ref</code>/<code>in</code>/<code>out</code>-параметр итератора — <b>CS1623</b>. Обход смешения — два метода (return-метод + yield-метод).' },
  ],

  foot: 'урок · <b>контракт yield</b> · 5 анимир. разборов · панель диагностик CS1622 / CS1623 · дизайн <b>mid</b>',
};
