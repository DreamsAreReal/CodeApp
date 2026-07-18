/**
 * Lesson: Композиция задач — старт, WhenAll, WhenAny (CS.S2.composition) — expert density,
 * 5 animated deep-dives. How to run async operations concurrently: START the tasks first and
 * await where you need the result (awaiting immediately after each start = sequential, NO
 * concurrency); Task.WhenAll completes when ALL finish and gives all results; Task.WhenAny returns
 * a Task<Task> wrapper for the FIRST to finish (needs an extra await to get the result); a faulted
 * task's exception lives in Task.Exception (AggregateException) but awaiting rethrows only the
 * FIRST inner exception; and composing async + sync work stays asynchronous.
 *
 * SIGNATURE machine panel (s1): concurrency — start-then-await (WhenAll) runs ~1x the single-task
 * time, while await-after-each-start runs ~2x. REAL run-csharp timing, evidence/F9/composition-exec.txt.
 *
 * Accuracy contract (G4/G7/G8) — verified against Learn asynchronous-programming (fetch 2026-07-18)
 * + GT-M4-s2.md:
 *   - every English quote is VERBATIM from learn.microsoft.com/.../asynchronous-programming/;
 *   - every card's verify.expect is the REAL stdout of run-csharp (evidence/F9/composition-exec.txt:
 *     "1,2,3"; "2x"; "2,3,1");
 *   - NO GT-M4 myths: async is NOT parallelism/concurrency-if-awaited-immediately (M-async-1);
 *     await a faulted task rethrows the FIRST exception, NOT AggregateException (M-exc-1);
 *     WhenAny gives a Task<Task> that must be awaited again (tap:F11/F12).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S2.composition/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1 (SIGNATURE): concurrency panel — sequential (2x) lane vs start-then-await (1x) lane.
const Z_SEQ: Zone = { id: "seq", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "await ПОСЛЕ каждого", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "последовательно ~2x", subCls: "vz-zsub heap", subY: 47 };
const Z_CONC: Zone = { id: "conc", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "старт → WhenAll", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "конкурентно ~1x", subCls: "vz-zsub good", subY: 47 };
const CONC_ZONES: Zone[] = [Z_SEQ, Z_CONC];

// s2: WhenAll — all tasks, one gate.
const Z_TASKS: Zone = { id: "tasks", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "ЗАДАЧИ", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "все стартованы", subCls: "vz-zsub", subY: 47 };
const Z_ALL: Zone = { id: "all", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone good", label: "WhenAll", labelCls: "vz-zlabel good", lx: 257, ly: 24, sub: "готово, когда ВСЕ", subCls: "vz-zsub good", subY: 47 };
const ALL_ZONES: Zone[] = [Z_TASKS, Z_ALL];

// s3: WhenAny — Task<Task> wrapper, extra await.
const Z_RACE: Zone = { id: "race", x: 14, y: 34, w: 138, h: 168, cls: "vz-zone", label: "WhenAny · гонка", labelCls: "vz-zlabel", lx: 83, ly: 24, sub: "первая завершившаяся", subCls: "vz-zsub", subY: 47 };
const Z_WRAP: Zone = { id: "wrap", x: 188, y: 34, w: 138, h: 168, cls: "vz-zone heap", label: "Task<Task>", labelCls: "vz-zlabel heap", lx: 257, ly: 24, sub: "нужен ещё await", subCls: "vz-zsub heap", subY: 47 };
const ANY_ZONES: Zone[] = [Z_RACE, Z_WRAP];

// s4: process as they complete — WhenAny loop.
const Z_LOOP: Zone = { id: "loop", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "ОБРАБОТКА ПО МЕРЕ ЗАВЕРШЕНИЯ", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "while + WhenAny + Remove", subCls: "vz-zsub", subY: 47 };
const LOOP_ZONES: Zone[] = [Z_LOOP];

// s5: faulted — first exception on await, all in Task.Exception.
const Z_FAULT: Zone = { id: "fault", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "await WhenAll", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "бросает ПЕРВОЕ", subCls: "vz-zsub", subY: 47 };
const Z_AGG: Zone = { id: "agg", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "Task.Exception", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "все в InnerExceptions", subCls: "vz-zsub heap", subY: 47 };
const FAULT_ZONES: Zone[] = [Z_FAULT, Z_AGG];

export const composition: LessonData = {
  id: "CS.S2.composition",
  track: "CS",
  section: "CS.S2",
  module: "S2.2",
  lang: "csharp",
  title: "Композиция: старт, WhenAll, WhenAny",
  kicker: "C# вглубь · S2 · конкурентность",
  home: { subtitle: "старт задач, WhenAll/WhenAny, faulted", icon: "async", estMinutes: 10 },
  prereqs: ["CS.S2.tap-model"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-async-over", kind: "doc", org: "Microsoft Learn", title: "Asynchronous programming (C# overview)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/", date: "2025-03-10" },
  ],

  spec: [
    { text: "«The WhenAny method… returns a `Task<Task>` object that completes when any of its arguments complete… to retrieve that task's result or ensure any exceptions are properly thrown, you must `await` the completed task itself.»", source: "ms-async-over" },
  ],
  edgeCases: [
    { text: "<b>Композиция</b>: «if any portion of an operation is asynchronous, the <span class=\"hl\">entire operation is asynchronous</span>» — async + последующая синхронная работа остаётся async.", source: "ms-async-over" },
    { text: "Упавшая задача — <b>faulted</b>: исключение в <code>Task.Exception</code> (<code>AggregateException</code>); <code>await</code> перебрасывает <span class=\"hl\">ПЕРВОЕ</span> из <code>InnerExceptions</code>, НЕ AggregateException. Все — в <code>Task.Exception.InnerExceptions</code>.", source: "ms-async-over" },
    { text: "Блокирующие API → await-эквиваленты: <code>Task.Wait</code>/<code>Result</code> → <code>await</code>; <code>WaitAny</code> → <code>await WhenAny</code>; <code>WaitAll</code> → <code>await WhenAll</code>. Валидацию аргументов бросать синхронно.", source: "ms-async-over" },
  ],

  misconceptions: [
    {
      wrong: "async сам делает задачи конкурентными; await у faulted бросает AggregateException",
      hook: 'Две ловушки композиции. «<span class="wrong">async сам распараллеливает</span>» — нет: если <code>await</code> стоит сразу после старта КАЖДОЙ задачи, они идут <b>последовательно</b> (~2x времени). Конкурентность даёт паттерн «<span class="hl">сначала стартуй, await — где нужен результат</span>». И «<span class="wrong">await упавшей задачи бросает AggregateException</span>» — нет: <code>await</code> перебрасывает ПЕРВОЕ внутреннее исключение. Ниже <b>пять разборов</b>: <b>машинная панель</b> конкурентности (замер ~1x vs ~2x), <code>WhenAll</code>, <code>WhenAny</code> как <code>Task&lt;Task&gt;</code>, обработка по мере завершения, и faulted-задача.',
      source: "ms-async-over",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Машинная панель · конкурентность", title: "Старт → WhenAll ~1x против await-после-каждого ~2x",
      viewBox: "0 0 340 210", zones: CONC_ZONES,
      code: ["int a = await V(100); int b = await V(100);   // последовательно ~2x", "var x = V(100); var y = V(100);   // старт обеих", "await Task.WhenAll(x, y);         // конкурентно ~1x"],
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>int a=await V(); int b=await V();</code>: вторая стартует ТОЛЬКО после завершения первой → <span class="hl">последовательно</span>.', nodes: [{ id: "s", kind: "gate", at: { zone: "seq", row: 0 }, state: "fail", label: "await, await", detail: "~2x", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>var x=V(); var y=V();</code>: обе <b>стартованы сразу</b>, задачи идут одновременно (один поток ведёт обе — не параллелизм).', nodes: [{ id: "s", kind: "gate", at: { zone: "seq", row: 0 }, state: "fail", label: "последовательно", detail: "~2x" }, { id: "c", kind: "chip", at: { zone: "conc", row: 0 }, value: "обе стартованы", accent: true }], edges: [] },
        { codeLine: 2, out: "2x", caption: 'Замер: последовательный вариант — <b>~2x</b>; старт-обеих-then-WhenAll — <span class="hl">~1x</span>. «total cook time is reduced because some tasks run concurrently» (реальный прогон).', nodes: [{ id: "s", kind: "gate", at: { zone: "seq", row: 0 }, state: "fail", label: "await каждого", detail: "~2x" }, { id: "cg", kind: "gate", at: { zone: "conc", row: 0 }, state: "ok", label: "WhenAll", detail: "~1x", accent: true }], edges: [] },
      ],
      explain: 'Это машинная панель урока — конкурентность, снятая по времени. Паттерн из доки: «You start all the asynchronous tasks at once. You wait on each task <span class="hl">only when you need the results</span>». Прогон: <code>await V(); await V();</code> (await сразу после старта каждой) — <b>~2x</b> времени одной задачи (последовательно), а <code>var x=V(); var y=V(); await WhenAll(x,y)</code> — <b>~1x</b>: «The total cook time is reduced because some tasks run concurrently». Ключ: <code>async</code> сам НЕ делает код конкурентным — конкурентность появляется, когда ты стартуешь задачи и <code>await</code>-ишь их в точке, где нужен результат. И это конкурентность, не параллелизм (один поток ведёт обе задачи).',
      sources: ["ms-async-over"],
    },
    {
      id: "s2", num: "02", kicker: "WhenAll · все задачи", title: "WhenAll завершается, когда завершены ВСЕ",
      viewBox: "0 0 340 210", zones: ALL_ZONES,
      code: ["int[] r = await Task.WhenAll(V(50,1), V(30,2), V(10,3));", "// r == {1,2,3} — все результаты, в порядке аргументов", "Console.WriteLine(string.Join(\",\", r));"],
      predictAt: 1, predictQ: 'Три задачи <code>V(50,1), V(30,2), V(10,3)</code>. Что вернёт <code>await Task.WhenAll(...)</code> (учти порядок)?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Три задачи стартованы; <code>WhenAll</code> ждёт, пока <span class="hl">все</span> завершатся (не первую, не по времени).', nodes: [{ id: "t1", kind: "chip", at: { zone: "tasks", row: 0 }, value: "V(50,1)" }, { id: "t2", kind: "chip", at: { zone: "tasks", row: 1 }, value: "V(30,2)" }, { id: "t3", kind: "chip", at: { zone: "tasks", row: 2 }, value: "V(10,3)", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>WhenAll</code> собирает результаты в массив <span class="hl">в порядке аргументов</span> (не в порядке завершения): {1, 2, 3}.', nodes: [{ id: "g", kind: "gate", at: { zone: "all", row: 0 }, state: "ok", label: "все готовы", detail: "→ int[]", accent: true }], edges: [] },
        { codeLine: 2, out: "1,2,3", caption: 'Печать: <b>1,2,3</b> — результаты в порядке задач-аргументов, хотя V(10,3) завершилась первой (реальный прогон).', nodes: [{ id: "g", kind: "gate", at: { zone: "all", row: 0 }, state: "ok", label: "WhenAll → r", detail: "1,2,3", accent: true }], edges: [] },
      ],
      explain: 'Дословно: «the <code>WhenAll</code> method… returns a <code>Task</code> object that <span class="hl">completes when all the tasks in its argument list are complete</span>». Для <code>Task&lt;T&gt;</code>-версии результат — массив в <b>порядке аргументов</b> (не завершения): прогон <code>WhenAll(V(50,1), V(30,2), V(10,3))</code> даёт <code>1,2,3</code>. Это замена цепочки <code>await eggsTask; await hashBrownTask; await toastTask;</code> одним ожиданием. Практика: стартуй независимые задачи, потом один <code>await WhenAll</code> — читаемо и конкурентно. (Блокирующий аналог <code>Task.WaitAll</code> оборачивает исключения в <code>AggregateException</code> — предпочитай <code>await WhenAll</code>.)',
      sources: ["ms-async-over"],
    },
    {
      id: "s3", num: "03", kicker: "WhenAny · первая завершившаяся", title: "WhenAny → Task<Task>, нужен ещё один await",
      viewBox: "0 0 340 210", zones: ANY_ZONES,
      code: ["var slow = V(100,\"slow\"); var fast = V(10,\"fast\");", "Task<string> finished = await Task.WhenAny(slow, fast);  // обёртка", "string first = await finished;   // ещё один await за результатом"],
      predictAt: 1, predictQ: '<code>await Task.WhenAny(slow, fast)</code> — что возвращает: результат первой задачи или что-то другое?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: '<code>await WhenAny</code> завершается при завершении <b>любой</b>. Но возвращает не результат, а <span class="hl">Task&lt;Task&gt;</span> — обёртку с завершившейся задачей.', nodes: [{ id: "r", kind: "gate", at: { zone: "race", row: 0 }, state: "ok", label: "fast готова", detail: "первая" }, { id: "w", kind: "obj", at: { zone: "wrap", row: 0 }, typeTag: "Task<Task>", value: "→ finished", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Чтобы достать результат/исключение — нужен <span class="hl">ещё один await</span> самой завершившейся задачи: <code>await finished</code>.', nodes: [{ id: "w", kind: "obj", at: { zone: "wrap", row: 0 }, typeTag: "finished", value: "Task<string>" }, { id: "a", kind: "gate", at: { zone: "wrap", row: 1 }, state: "ok", label: "await finished", detail: "результат", accent: true }], edges: [] },
        { codeLine: 2, out: "fast", caption: 'Результат — <b>fast</b> (завершилась за 10мс раньше slow). Реальный прогон.', nodes: [{ id: "res", kind: "gate", at: { zone: "wrap", row: 0 }, state: "ok", label: "await finished", detail: "fast", accent: true }], edges: [] },
      ],
      explain: 'Ключевая тонкость <code>WhenAny</code>. Дословно: «the <code>WhenAny</code> method… returns a <span class="hl"><code>Task&lt;Task&gt;</code></span> object that completes when any of its arguments complete… <code>Task.WhenAny</code> returns a <code>Task&lt;Task&gt;</code> — a wrapper task that contains the completed task». То есть <code>await Task.WhenAny(...)</code> даёт не результат, а завершившуюся ЗАДАЧУ; «to retrieve that task\'s result or ensure any exceptions are properly thrown, you must <b>await the completed task itself</b>». Поэтому два await: первый — дождаться первой финишировавшей, второй — <code>await finished</code> за результатом. Прогон: <code>fast</code> (10мс) обгоняет <code>slow</code> (100мс).',
      sources: ["ms-async-over"],
    },
    {
      id: "s4", num: "04", kicker: "Обработка по мере завершения", title: "while + WhenAny + Remove: реагируй, как только готово",
      viewBox: "0 0 340 210", zones: LOOP_ZONES,
      code: ["var tasks = new List<Task<int>>{ V(30,1), V(10,2), V(20,3) };", "while (tasks.Any()) {", "  var done = await Task.WhenAny(tasks);", "  tasks.Remove(done); order.Add(await done); }"],
      predictAt: 1, predictQ: 'Задачи V(30,1), V(10,2), V(20,3). В каком порядке цикл WhenAny обработает результаты?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Цикл: пока есть задачи — <code>await WhenAny</code> ждёт <span class="hl">ближайшую завершившуюся</span>, обрабатывает её и <code>Remove</code>-ит.', nodes: [{ id: "l", kind: "gate", at: { zone: "loop", row: 0 }, state: "ok", label: "while + WhenAny", detail: "по мере готовности", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Порядок обработки — <b>по времени завершения</b>: V(10,2) первой, потом V(20,3), потом V(30,1). Не по порядку в списке.', nodes: [{ id: "l", kind: "gate", at: { zone: "loop", row: 0 }, state: "ok", label: "WhenAny", detail: "первая готовая" }, { id: "o", kind: "chip", at: { zone: "loop", row: 1 }, value: "10мс → 20мс → 30мс", accent: true }], edges: [] },
        { codeLine: 3, out: "2,3,1", caption: 'Печать порядка результатов: <b>2,3,1</b> — по времени (10, 20, 30 мс), а не 1,2,3 (реальный прогон).', nodes: [{ id: "res", kind: "gate", at: { zone: "loop", row: 0 }, state: "ok", label: "order", detail: "2,3,1", accent: true }], edges: [] },
      ],
      explain: 'Паттерн «обработка по мере завершения»: «You use the <code>WhenAny</code> method to wait on the first task to finish and then process its result. After you process the result… you <b>remove the completed task</b> from the list of tasks». Прогон: задачи <code>V(30,1), V(10,2), V(20,3)</code> обрабатываются в порядке <b>2,3,1</b> — по времени завершения (10, 20, 30 мс), а не по позиции в списке. Внутри цикла обязателен <code>await done</code> (второй await) — достать результат/исключение завершившейся задачи. Это то, чем <code>WhenAny</code> в цикле ценнее <code>WhenAll</code>: реагируешь сразу, не ждёшь самую медленную.',
      sources: ["ms-async-over"],
    },
    {
      id: "s5", num: "05", kicker: "Faulted · первое исключение", title: "await WhenAll бросает ПЕРВОЕ, все — в Task.Exception",
      viewBox: "0 0 340 210", zones: FAULT_ZONES,
      code: ["var t = Task.WhenAll(Boom(\"one\"), Boom(\"two\"));   // обе бросят", "try { await t; }", "catch (Exception ex) { /* ex — ПЕРВОЕ, не AggregateException */ }", "// t.Exception.InnerExceptions.Count == 2 — все здесь"],
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Обе задачи бросают исключение. Задача <code>t</code> — <b>faulted</b>: исключения складываются в <code>t.Exception</code> (<code>AggregateException</code>).', nodes: [{ id: "f", kind: "gate", at: { zone: "fault", row: 0 }, state: "fail", label: "обе Boom", detail: "faulted", accent: true }, { id: "a", kind: "obj", at: { zone: "agg", row: 0 }, typeTag: "AggregateException", value: "2 внутри" }], edges: [] },
        { codeLine: 2, out: "", caption: '<code>await t</code> перебрасывает <span class="hl">ПЕРВОЕ</span> внутреннее исключение (<code>InvalidOperationException</code>), а НЕ <code>AggregateException</code>.', nodes: [{ id: "aw", kind: "gate", at: { zone: "fault", row: 0 }, state: "fail", label: "await t", detail: "первое искл.", accent: true }, { id: "a", kind: "obj", at: { zone: "agg", row: 0 }, typeTag: "Task.Exception", value: "все" }], edges: [] },
        { codeLine: 3, out: "caught: InvalidOperationException | agg count: 2", caption: 'Поймано <b>InvalidOperationException</b> (первое), но <code>t.Exception.InnerExceptions.Count</code> = <span class="hl">2</span> — все живут там (реальный прогон).', nodes: [{ id: "c", kind: "gate", at: { zone: "fault", row: 0 }, state: "ok", label: "catch", detail: "первое" }, { id: "cnt", kind: "gate", at: { zone: "agg", row: 0 }, state: "ok", label: "InnerExceptions", detail: "2", accent: true }], edges: [] },
      ],
      explain: 'Ядро async-исключений (подробно — S2.7), опровержение мифа «await бросает AggregateException». Дословно: «The <code>Task.Exception</code> property is a <code>System.AggregateException</code> object because more than one exception might be thrown… When your code waits on a faulted task, it <span class="hl">rethrows the first <code>AggregateException.InnerExceptions</code> exception</span>… This result is the reason why the output… shows an <code>InvalidOperationException</code> object rather than an <code>AggregateException</code>». Прогон: <code>await WhenAll(Boom, Boom)</code> ловится как <code>InvalidOperationException</code> (первое), но <code>t.Exception.InnerExceptions.Count == 2</code> — оба там. Чтобы увидеть ВСЕ — читай <code>t.Exception.InnerExceptions</code>, а не полагайся на <code>catch</code>.',
      sources: ["ms-async-over"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>async Task&lt;int&gt; V(int ms,int v){ await Task.Delay(ms); return v; } int[] r = await Task.WhenAll(V(50,1), V(30,2), V(10,3)); Console.WriteLine(string.Join(",", r));</code> — что напечатает?',
      options: ["1,2,3", "3,2,1", "1", "3,1,2"], correctIndex: 0, xp: 10,
      okText: '<code>WhenAll</code> ждёт ВСЕ и собирает результаты в <span class="hl">порядке аргументов</span> (не завершения): <b>1,2,3</b>, хотя V(10,3) финишировала первой.',
      noText: '«WhenAll… completes when all the tasks… are complete». Массив результатов — по порядку задач-аргументов. Реальный вывод: <b>1,2,3</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "1,2,3" }, sourceRefs: ["ms-async-over"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>async Task&lt;int&gt; V(int ms){ await Task.Delay(ms); return ms; } var sw=Stopwatch.StartNew(); int a=await V(100); int b=await V(100); Console.Write(sw.ElapsedMilliseconds >= 190 ? "2x" : "1x");</code> — что напечатает?',
      options: ["2x", "1x", "4x", "0x"], correctIndex: 0, xp: 10,
      okText: '<code>await V(); await V();</code> — вторая стартует ТОЛЬКО после первой → <span class="hl">последовательно ~2x</span>. <code>async</code> сам НЕ делает конкурентным.',
      noText: 'await сразу после старта каждой задачи = нет конкурентности. Реальный вывод: <b>2x</b>. Для ~1x: стартуй обе, потом <code>WhenAll</code>.',
      verify: { kind: "exec", run: "dotnet run", expect: "2x" }, sourceRefs: ["ms-async-over"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var tasks = new List&lt;Task&lt;int&gt;&gt;{ V(30,1), V(10,2), V(20,3) }; while(tasks.Any()){ var done=await Task.WhenAny(tasks); tasks.Remove(done); order.Add(await done); } Console.WriteLine(string.Join(",", order));</code> — что напечатает?',
      options: ["2,3,1", "1,2,3", "3,2,1", "1,3,2"], correctIndex: 0, xp: 10,
      okText: 'Цикл <code>WhenAny</code> обрабатывает по <span class="hl">времени завершения</span>: V(10,2)→V(20,3)→V(30,1) = <b>2,3,1</b>. Обязателен второй <code>await done</code> за результатом.',
      noText: '«WhenAny… wait on the first task to finish… then process its result». Порядок — по времени (10,20,30 мс), не по списку. Реальный вывод: <b>2,3,1</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "2,3,1" }, sourceRefs: ["ms-async-over"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Старт → await", v: 'Конкурентность даёт паттерн «<span class="hl">стартуй задачи, await — где нужен результат</span>»: замер ~1x против ~2x при <code>await</code> сразу после каждого старта. Это конкурентность, не параллелизм (один поток).' },
    { icon: "cost", k: "WhenAll vs WhenAny", v: '<code>WhenAll</code> → готово, когда <b>все</b> (результаты в порядке аргументов). <code>WhenAny</code> → <code>Task&lt;Task&gt;</code> первой завершившейся, нужен <span class="hl">ещё один await</span> за результатом; в цикле — обработка по мере готовности.' },
    { icon: "avoid", k: "Faulted", v: '<code>await</code> упавшей задачи бросает <b>ПЕРВОЕ</b> внутреннее исключение, НЕ <code>AggregateException</code>. Все живут в <code>Task.Exception.InnerExceptions</code> (замер: count 2). Композиция async+sync остаётся async.' },
  ],

  foot: 'урок · <b>композиция задач</b> · 5 анимир. разборов · панель конкурентности (1x vs 2x) · дизайн <b>mid</b>',
};
