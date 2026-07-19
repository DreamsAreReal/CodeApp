/**
 * Lesson: ValueTask / ValueTask<T> — when to reach for it and its constraints (CS.S2.valuetask) —
 * expert density, 5 animated deep-dives. ValueTask<T> is a readonly struct (value type) that wraps
 * EITHER a Task<T> OR a T: it avoids the per-call heap allocation of Task<T> when the result is
 * usually available synchronously and the method is called often enough that the allocation matters.
 * It is NOT a free "always faster" — it carries hard usage constraints (await EXACTLY once) and real
 * tradeoffs (bigger struct, bigger state machine). Default stays Task/Task<T>.
 *
 * SIGNATURE machine panel (s5): typeof(ValueTask<int>).IsValueType == True with 4 instance fields
 * (fields _obj, _result, _continueOnCapturedContext, _token), vs Task<int> reference type (False). A real reflection
 * measurement — the struct-width that makes "returning it copies more than Task's one reference
 * field". evidence/F10/valuetask-exec.txt.
 *
 * Accuracy contract (G4/G7/G8) — verified against ValueTask<T> API docs (fetch 2026-07-18) +
 * GT-M4-s2.md S2.5 (rt:F9..F17):
 *   - every card's verify.expect is the REAL stdout of run-csharp (evidence/F10/valuetask-exec.txt:
 *     "r=7 completed=True"; "True 0"; "True False fields=4");
 *   - NO GT-M4 myths: M-vt-7 (ValueTask always faster) — shown as a tradeoff, default is Task;
 *     M-vt-8 (await multiple times) — a ValueTask instance is awaited EXACTLY once, AsTask() for
 *     reuse (shown as an in-lesson fact + AsTask escape hatch); M-vt-9 (.Result readable like Task).
 *
 * Loop: cards c1..c3 map to backend review items `CS.S2.valuetask/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: what ValueTask<T> is — a struct wrapping Task<T> OR T.
const Z_VT: Zone = { id: "vt", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "ValueTask<T> · readonly struct", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "оборачивает Task<T> ИЛИ T (одно из двух)", subCls: "vz-zsub good", subY: 47 };
const VT_ZONES: Zone[] = [Z_VT];

// s2: when to reach for it — sync-available result on a hot path.
const Z_HOT: Zone = { id: "hot", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "часто + синхронно", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "ValueTask · без аллокации", subCls: "vz-zsub good", subY: 47 };
const Z_DEF: Zone = { id: "def", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "всё остальное", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "Task<T> · дефолт", subCls: "vz-zsub", subY: 47 };
const WHEN_ZONES: Zone[] = [Z_HOT, Z_DEF];

// s3: the "await exactly once" constraint + AsTask escape hatch.
const Z_ONCE: Zone = { id: "once", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "await РОВНО ОДИН раз", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "повторно → undefined", subCls: "vz-zsub heap", subY: 47 };
const Z_ASTASK: Zone = { id: "astask", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "AsTask()", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "нужен повтор → Task", subCls: "vz-zsub good", subY: 47 };
const ONCE_ZONES: Zone[] = [Z_ONCE, Z_ASTASK];

// s4: default(ValueTask<T>) — a sync-completed result carrying default(T).
const Z_DFLT: Zone = { id: "dflt", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone", label: "default(ValueTask<int>)", labelCls: "vz-zlabel", lx: 170, ly: 24, sub: "sync-completed · Result == default(T)", subCls: "vz-zsub", subY: 47 };
const DFLT_ZONES: Zone[] = [Z_DFLT];

// s5 (SIGNATURE): value type, 4 fields, vs Task reference.
const Z_STRUCT: Zone = { id: "struct", x: 14, y: 34, w: 176, h: 168, cls: "vz-zone good", label: "ValueTask<int>", labelCls: "vz-zlabel good sm", lx: 102, ly: 24, sub: "value type · 4 поля", subCls: "vz-zsub good", subY: 47 };
const Z_REF: Zone = { id: "ref", x: 202, y: 34, w: 124, h: 168, cls: "vz-zone heap", label: "Task<int>", labelCls: "vz-zlabel heap sm", lx: 264, ly: 24, sub: "reference · 1 field", subCls: "vz-zsub heap", subY: 47 };
const SIG_ZONES: Zone[] = [Z_STRUCT, Z_REF];

export const valueTask: LessonData = {
  id: "CS.S2.valuetask",
  track: "CS",
  section: "CS.S2",
  module: "S2.5",
  lang: "csharp",
  title: "ValueTask<T>: когда брать и его ограничения",
  kicker: "C# вглубь · S2 · горячий путь",
  home: { subtitle: "value type вместо Task, await один раз, трейдофы", icon: "async", estMinutes: 9 },
  prereqs: ["CS.S2.return-types"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-vt", kind: "doc", org: "Microsoft Learn", title: "ValueTask<TResult> Struct", url: "https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.valuetask-1", date: "2024-12-01" },
    { id: "ms-vt0", kind: "doc", org: "Microsoft Learn", title: "ValueTask Struct", url: "https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.valuetask", date: "2024-12-01" },
  ],

  spec: [
    { text: "«A ValueTask<TResult> instance may only be awaited once, and consumers may not read Result until the instance has completed.» — экземпляр можно await ровно один раз; для повторного использования — AsTask() или Preserve().", source: "ms-vt" },
  ],
  edgeCases: [
    { text: "«should never» (иначе поведение UNDEFINED): await один экземпляр <b>несколько раз</b>; вызывать <code>AsTask</code> несколько раз; читать <code>.Result</code>/<code>.GetAwaiter().GetResult()</code> <b>до завершения</b> или повторно; <b>смешивать</b> способы потребления. Один экземпляр — один способ, один раз.", source: "ms-vt" },
    { text: "«The non generic version of ValueTask is not recommended for most scenarios» — брать почти всегда стоит <code>ValueTask&lt;T&gt;</code> либо <code>Task</code>, а не голый <code>ValueTask</code>.", source: "ms-vt" },
    { text: "<code>default(ValueTask&lt;T&gt;)</code> — валидный <b>синхронно завершённый</b> результат со значением <code>default(TResult)</code>: удобно возвращать «готово, значение по умолчанию» без аллокации.", source: "ms-vt" },
  ],

  misconceptions: [
    {
      wrong: "ValueTask всегда быстрее Task, его можно await сколько угодно и .Result читать как у Task",
      hook: 'Три опасные ошибки разом. «<span class="wrong">ValueTask всегда быстрее</span>» — нет: это struct с <b>несколькими полями</b>, его возврат копирует больше, чем один ссылочный field у <code>Task</code>, и раздувает стейт-машину; выигрыш есть ТОЛЬКО когда результат обычно готов синхронно и метод в горячем цикле. «<span class="wrong">await сколько угодно</span>» — нет: «<span class="hl">may only be awaited once</span>»; повторно — undefined, нужен повтор → <code>AsTask()</code>. «<span class="wrong">.Result как у Task</span>» — нет: до завершения/повторно — undefined. Ниже <b>пять разборов</b>: что это, когда брать, «один раз» + AsTask, <code>default</code>, и <b>машинная панель</b> — value type в 4 поля vs reference.',
      source: "ms-vt",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Что это", title: "ValueTask<T> — struct, обёртка над Task<T> ИЛИ T",
      viewBox: "0 0 340 210", zones: VT_ZONES,
      code: ["public readonly struct ValueTask<TResult>   // value type, не класс", "ValueTask<int> a = new ValueTask<int>(42);       // оборачивает T (готово, без Task)", "ValueTask<int> b = new ValueTask<int>(SomeTaskInt); // оборачивает Task<T>"],
      scenes: [
        { codeLine: 0, caption: '<code>ValueTask&lt;T&gt;</code> — <span class="hl">readonly struct</span> (value type), а не ссылочный <code>Task&lt;T&gt;</code>.', nodes: [{ id: "s", kind: "chip", at: { zone: "vt", row: 0, col: 0 }, value: "readonly struct", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Оборачивает <b>значение <code>T</code></b> напрямую: результат уже есть — никакого <code>Task</code> из кучи не создаётся.', nodes: [{ id: "s", kind: "chip", at: { zone: "vt", row: 0, col: 0 }, value: "struct" }, { id: "t", kind: "chip", at: { zone: "vt", row: 1, col: 0 }, value: "оборачивает T", accent: true }], edges: [] },
        { codeLine: 2, caption: 'ИЛИ оборачивает <code>Task&lt;T&gt;</code> (когда результат придёт асинхронно). <span class="hl">Одно из двух</span> — union.', nodes: [{ id: "s", kind: "chip", at: { zone: "vt", row: 0, col: 0 }, value: "struct" }, { id: "t", kind: "chip", at: { zone: "vt", row: 1, col: 0 }, value: "T" }, { id: "tk", kind: "chip", at: { zone: "vt", row: 1, col: 1 }, value: "или Task<T>", accent: true }], edges: [] },
      ],
      explain: 'Дословно: <code>ValueTask&lt;TResult&gt;</code> — «a value type that wraps a <code>Task&lt;TResult&gt;</code> and a <code>TResult</code>, only one of which is used». Это <code>readonly struct</code>: живёт на стеке / внутри вызывающего кадра, а не в отдельном объекте кучи. Смысл союза: если async-метод часто может вернуть результат <b>синхронно</b> (кэш, буфер уже полон), он оборачивает готовое <code>T</code> — и не платит за аллокацию <code>Task&lt;T&gt;</code>. Если же нужно ждать — оборачивает <code>Task&lt;T&gt;</code>. По умолчанию всё равно возвращают <code>Task</code>/<code>Task&lt;T&gt;</code>; <code>ValueTask</code> — оптимизация под конкретный профиль (разбор 02).',
      sources: ["ms-vt"],
    },
    {
      id: "s2", num: "02", kicker: "Когда брать", title: "Только: результат обычно синхронный И метод горячий",
      viewBox: "0 0 340 210", zones: WHEN_ZONES,
      code: ["async ValueTask<int> ReadCached(int key){        // горячий путь + кэш", "  if (cache.TryGet(key, out var v)) return v;     // ЧАСТО: синхронно, без Task-аллокации", "  return await LoadFromDiskAsync(key); }           // РЕДКО: настоящий await"],
      console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'Условие применимости: результат <span class="hl">вероятно доступен синхронно</span> (кэш-хит) И метод зовётся так часто, что аллокация <code>Task</code> на каждый вызов недопустима.', nodes: [{ id: "h", kind: "gate", at: { zone: "hot", row: 0 }, state: "ok", label: "кэш-хит", detail: "sync · без Task", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'При промахе — обычный <code>await</code>: <code>ValueTask</code> оборачивает <code>Task</code>. Оба случая — один тип.', nodes: [{ id: "h", kind: "gate", at: { zone: "hot", row: 0 }, state: "ok", label: "кэш-хит", detail: "sync" }, { id: "d", kind: "gate", at: { zone: "def", row: 0 }, state: "", label: "промах", detail: "await Task", accent: true }], edges: [] },
        { codeLine: 0, out: "sync-путь без аллокации", caption: 'Дефолт остаётся <code>Task</code>/<code>Task&lt;T&gt;</code>. <code>ValueTask</code> берут <span class="hl">только когда профилирование это оправдало</span> — не «на всякий случай».', nodes: [{ id: "h", kind: "gate", at: { zone: "hot", row: 0 }, state: "ok", label: "ValueTask", detail: "оправдан замером", accent: true }, { id: "d", kind: "gate", at: { zone: "def", row: 0 }, state: "ok", label: "Task", detail: "дефолт" }], edges: [] },
      ],
      explain: 'Точное условие (verbatim, valuetask-1 Remarks): «A method may return an instance of this value type when <span class="hl">it\'s likely that the result of its operation will be available synchronously</span>, and when it\'s <span class="hl">expected to be invoked so frequently</span> that the cost of allocating a new <code>Task&lt;TResult&gt;</code> for each call will be prohibitive». То есть два фактора ОДНОВРЕМЕННО: (1) результат часто готов синхронно, (2) метод в горячем цикле. Если хоть один не выполнен — берите <code>Task</code>. Прямая рекомендация: «the <span class="hl">default choice for any asynchronous method should be to return a <code>Task</code> or <code>Task&lt;TResult&gt;</code></span>. Only if performance analysis proves it worthwhile should a <code>ValueTask&lt;TResult&gt;</code> be used instead of a <code>Task&lt;TResult&gt;</code>».',
      sources: ["ms-vt"],
    },
    {
      id: "s3", num: "03", kicker: "Один раз · AsTask", title: "await РОВНО ОДИН раз; повтор — только через AsTask()",
      viewBox: "0 0 340 210", zones: ONCE_ZONES,
      code: ["ValueTask<int> vt = ReadAsync();", "int a = await vt;  int b = await vt;   // ⛔ undefined: await ДВАЖДЫ", "Task<int> t = ReadAsync().AsTask(); int x=await t; int y=await t; // ✅ Task повторяем"],
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Экземпляр <code>ValueTask</code> — «<span class="hl">may only be awaited once</span>». Один инстанс = одно потребление.', nodes: [{ id: "o", kind: "gate", at: { zone: "once", row: 0 }, state: "ok", label: "await vt", detail: "первый раз OK", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Второй <code>await</code> того же <code>vt</code> — <span class="hl">undefined behaviour</span> (внутренний буфер уже мог быть переиспользован). Не делай так.', nodes: [{ id: "o", kind: "gate", at: { zone: "once", row: 0 }, state: "ok", label: "await vt", detail: "1×" }, { id: "o2", kind: "gate", at: { zone: "once", row: 1 }, state: "fail", label: "await vt снова", detail: "undefined", accent: true }], edges: [] },
        { codeLine: 2, out: "нужен повтор → AsTask()", caption: 'Нужен результат несколько раз — <code>AsTask()</code> (или <code>Preserve()</code>): даёт обычный <code>Task&lt;T&gt;</code>, который <span class="hl">можно await многократно</span> (замер ниже: 5 5).', nodes: [{ id: "o", kind: "gate", at: { zone: "once", row: 0 }, state: "", label: "vt", detail: "1×" }, { id: "a", kind: "gate", at: { zone: "astask", row: 0 }, state: "ok", label: "AsTask()", detail: "Task · N×", accent: true }], edges: [] },
      ],
      explain: 'Жёсткое правило потребления (verbatim, valuetask-1 Remarks): «A <code>ValueTask&lt;TResult&gt;</code> instance <span class="hl">may only be awaited once</span>, and consumers may not read <code>Result</code> until the instance has completed. If these limitations are unacceptable, convert the <code>ValueTask&lt;TResult&gt;</code> to a <code>Task&lt;TResult&gt;</code> by calling <code>AsTask</code>». Список «should never be performed» (иначе «the results are undefined»): «Awaiting the instance multiple times»; «Calling <code>AsTask</code> multiple times»; «Using <code>.Result</code> or <code>.GetAwaiter().GetResult()</code> when the operation hasn\'t yet completed, or using them multiple times»; «Using more than one of these techniques to consume the instance». Практика (замер: <b>5 5</b>): <code>Load().AsTask()</code> даёт <code>Task&lt;int&gt;</code>, который <code>await</code>-ится дважды и оба раза даёт 5. Поэтому: <code>ValueTask</code> — «await один раз и забудь»; нужен повтор — сразу <code>AsTask()</code>.',
      sources: ["ms-vt"],
    },
    {
      id: "s4", num: "04", kicker: "default(ValueTask)", title: "default(ValueTask<T>) — готовый результат = default(T)",
      viewBox: "0 0 340 210", zones: DFLT_ZONES,
      code: ["ValueTask<int> d = default;                 // == default(ValueTask<int>)", "bool done = d.IsCompletedSuccessfully;       // True — уже завершён", "int v = d.Result;                            // default(int) == 0"],
      predictAt: 1, predictQ: '<code>var d = default(ValueTask&lt;int&gt;)</code>. Что даст <code>$\"{d.IsCompletedSuccessfully} {d.Result}\"</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Как у любого struct, <code>default(ValueTask&lt;int&gt;)</code> валиден: это <span class="hl">синхронно завершённый</span> результат.', nodes: [{ id: "d", kind: "obj", at: { zone: "dflt", row: 0 }, typeTag: "default(ValueTask<int>)", value: "sync-completed", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>IsCompletedSuccessfully</code> → <b>True</b>: не нужно <code>await</code>, значение уже есть.', nodes: [{ id: "d", kind: "obj", at: { zone: "dflt", row: 0 }, typeTag: "default", value: "completed" }, { id: "ok", kind: "gate", at: { zone: "dflt", row: 1 }, state: "ok", label: "IsCompletedSuccessfully", detail: "True", accent: true }], edges: [] },
        { codeLine: 2, out: "True 0", caption: 'Печать: <b>True 0</b> — завершён, <code>Result</code> == <code>default(int)</code> == <b>0</b> (реальный прогон). Удобно для «готово, значение по умолчанию» без аллокации.', nodes: [{ id: "ok", kind: "gate", at: { zone: "dflt", row: 0 }, state: "ok", label: "IsCompletedSuccessfully", detail: "True" }, { id: "r", kind: "gate", at: { zone: "dflt", row: 1 }, state: "ok", label: "Result", detail: "0", accent: true }], edges: [] },
      ],
      explain: 'Дословно (valuetask-1 Remarks): «An instance created with the parameterless constructor or by the <code>default(ValueTask&lt;TResult&gt;)</code> syntax (a zero-initialized structure) represents a <span class="hl">synchronously, successfully completed operation with a result of <code>default(TResult)</code></span>». То есть <code>default(ValueTask&lt;int&gt;)</code> — не «пустой/невалидный», а полноценный <span class="hl">уже-завершённый</span> результат со значением <code>default(int) == 0</code>. Прогон: <code>IsCompletedSuccessfully</code> → <b>True</b>, <code>Result</code> → <b>0</b> (печать «True 0»). Практическая польза: возвращать «синхронно готово, значение по умолчанию» из <code>ValueTask</code>-метода без единой аллокации — просто <code>return default;</code>.',
      sources: ["ms-vt"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · struct-ширина", title: "ValueTask<int> — value type в 4 поля, Task<int> — 1 ссылка",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["typeof(ValueTask<int>).IsValueType   // True  — value type (struct)", "typeof(Task<int>).IsValueType        // False — reference (куча)", "ValueTask<int> fields = 4  // _obj _result _continueOnCapturedContext _token"],
      predictAt: 2, predictQ: '<code>ValueTask&lt;int&gt;.IsValueType</code>, <code>Task&lt;int&gt;.IsValueType</code>, и число instance-полей <code>ValueTask&lt;int&gt;</code> — что за тройка?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>ValueTask&lt;int&gt;</code> — <b>value type</b> (<code>IsValueType == True</code>): копируется по значению, без объекта кучи.', nodes: [{ id: "v", kind: "obj", at: { zone: "struct", row: 0 }, typeTag: "ValueTask<int>", value: "value type", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>Task&lt;int&gt;</code> — <b>reference</b> (<code>False</code>): один ссылочный field, объект в куче.', nodes: [{ id: "v", kind: "obj", at: { zone: "struct", row: 0 }, typeTag: "ValueTask<int>", value: "value" }, { id: "t", kind: "obj", at: { zone: "ref", row: 0 }, typeTag: "Task<int>", value: "1 ссылка", accent: true }], edges: [] },
        { codeLine: 2, out: "True False fields=4", caption: 'Панель: <b>True False fields=4</b> (реальная рефлексия). Struct шириной в <span class="hl">4 поля</span> — вот почему «возврат копирует больше, чем один field у Task», и стейт-машина толще. Это цена, а не бесплатный обед.', nodes: [{ id: "vt", kind: "gate", at: { zone: "struct", row: 0 }, state: "ok", label: "ValueTask value type", detail: "True · 4 поля" }, { id: "tf", kind: "gate", at: { zone: "ref", row: 0 }, state: "fail", label: "Task", detail: "False · 1 field", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель урока — струк­турная цена <code>ValueTask</code>, снятая рефлексией. Прогон: <code>typeof(ValueTask&lt;int&gt;).IsValueType</code> → <b>True</b>, <code>typeof(Task&lt;int&gt;).IsValueType</code> → <b>False</b>, число instance-полей <code>ValueTask&lt;int&gt;</code> → <b>4</b> (реальные имена по рефлексии: <code>_obj</code> — Task/источник, <code>_result</code> — значение, <code>_token</code>, <code>_continueOnCapturedContext</code>). Вот материальная основа трейдофа (verbatim, valuetask-1 Remarks): «it also <span class="hl">contains multiple fields</span>, whereas a <code>Task&lt;TResult&gt;</code> as a reference type is a single field. This means that returning a <code>ValueTask&lt;TResult&gt;</code> from a method <span class="hl">results in copying more data</span>. It also means, that if a method that returns a <code>ValueTask&lt;TResult&gt;</code> is awaited within an async method, <span class="hl">the state machine for that async method will be larger</span>, because it must store a struct containing multiple fields instead of a single reference». Отсюда правило: <code>ValueTask</code> экономит аллокацию на sync-пути, но платит копированием и размером — выигрыш реален только на подтверждённо горячем, обычно-синхронном коде.',
      sources: ["ms-vt"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>ValueTask&lt;int&gt; Cached(int x) =&gt; new ValueTask&lt;int&gt;(x); int r = await Cached(7); Console.WriteLine($"r={r} completed={Cached(7).IsCompleted}");</code> — что напечатает?',
      options: ["r=7 completed=True", "r=7 completed=False", "r=0 completed=True", "r=7 completed="], correctIndex: 0, xp: 10,
      okText: '<code>ValueTask</code>, обёрнутый вокруг готового <b>значения</b>, завершён <span class="hl">синхронно</span> — <code>IsCompleted == True</code>, никакого <code>Task</code> из кучи. Печать: <b>r=7 completed=True</b>.',
      noText: 'Обёртка над значением <code>T</code> — уже-завершённый результат без аллокации <code>Task</code>. Реальный вывод: <b>r=7 completed=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "r=7 completed=True" }, sourceRefs: ["ms-vt"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var d = default(ValueTask&lt;int&gt;); Console.WriteLine($"{d.IsCompletedSuccessfully} {d.Result}");</code> — что напечатает?',
      options: ["True 0", "False 0", "True 1", "(исключение)"], correctIndex: 0, xp: 10,
      okText: '<code>default(ValueTask&lt;TResult&gt;)</code> — «a zero-initialized structure» — «represents a synchronously, successfully completed operation with a result of <code>default(TResult)</code>»: завершён (<b>True</b>), <code>Result</code> == <code>default(int)</code> == <b>0</b>.',
      noText: '<code>default(ValueTask&lt;int&gt;)</code> — синхронно завершён со значением <code>default(int)</code>. Реальный вывод: <b>True 0</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True 0" }, sourceRefs: ["ms-vt"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var t = typeof(ValueTask&lt;int&gt;); int fields = t.GetFields(BindingFlags.Instance|BindingFlags.NonPublic|BindingFlags.Public).Length; Console.WriteLine($"{t.IsValueType} {typeof(Task&lt;int&gt;).IsValueType} fields={fields}");</code> — что напечатает?',
      options: ["True False fields=4", "False True fields=4", "True False fields=1", "True True fields=2"], correctIndex: 0, xp: 10,
      okText: '<code>ValueTask&lt;int&gt;</code> — <b>value type</b> (True) с <b>4 полями</b> (_obj/_result/_continueOnCapturedContext/_token), <code>Task&lt;int&gt;</code> — <b>reference</b> (False, 1 ссылка). Struct-ширина — корень трейдофа копирования.',
      noText: '«it also contains multiple fields, whereas a <code>Task&lt;TResult&gt;</code> as a reference type is a single field»; 4 instance-поля vs 1 ссылка у Task. Реальный вывод: <b>True False fields=4</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "True False fields=4" }, sourceRefs: ["ms-vt"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Что и когда", v: '<code>ValueTask&lt;T&gt;</code> — <b>readonly struct</b>, оборачивает <code>Task&lt;T&gt;</code> ИЛИ <code>T</code>. Брать ТОЛЬКО когда результат обычно синхронный И метод горячий (замером). Дефолт — <code>Task</code>/<code>Task&lt;T&gt;</code>.' },
    { icon: "avoid", k: "await один раз", v: 'Экземпляр — «<span class="hl">may only be awaited once</span>»; повторно/<code>.Result</code> до завершения — <b>undefined</b>. Нужен повтор — <code>AsTask()</code> (замер: 5 5). Non-generic <code>ValueTask</code> «is not recommended for most scenarios».' },
    { icon: "cost", k: "не бесплатно", v: 'Value type в <b>4 поля</b> (замер: True False fields=4) — возврат копирует больше, чем 1 ссылка <code>Task</code>, стейт-машина толще. <code>default(ValueTask&lt;T&gt;)</code> = sync-completed с <code>default(T)</code>.' },
  ],

  foot: 'урок · <b>ValueTask&lt;T&gt;</b> · 5 анимир. разборов · панель value type в 4 поля vs reference · дизайн <b>mid</b>',
};
