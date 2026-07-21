/**
 * Lesson: Interlocked — lock-free atomic operations (CS.S8.interlocked) — expert density, 5 animated
 * deep-dives. On most machines objCt++ is three machine steps (load / modify / store) and can lose an
 * update under preemption; Interlocked.Increment/Decrement/Add do the whole read-modify-write as ONE
 * atomic operation. Exchange atomically swaps and returns the previous value; CompareExchange does a
 * conditional swap (compare-and-swap, CAS) — the primitive under lock-free algorithms. The members
 * never throw and the type is thread safe; internally it emits a single lock prefix when uncontended.
 *
 * SIGNATURE machine panel (s5): 8 threads each Interlocked.Increment 100000 times produce EXACTLY
 * 800000 — no lost updates — REAL run-csharp measurement (this file's exec cards): counter=800000.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from the Interlocked class API page, fetched 2026-07-21;
 *   - every card's verify.expect is the REAL, DETERMINISTIC stdout of run-csharp (atomic ops are
 *     inherently deterministic; all threads JOINED before print): c1 "counter=800000" ·
 *     c2 "old=5 new=10" · c3 "r1=7 afterMatch=100 r2=100 afterMiss=100".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S8.interlocked/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: objCt++ is three steps.
const Z_STEPS: Zone = { id: "steps", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone heap", label: "objCt++ · НЕ атомарно", labelCls: "vz-zlabel heap sm", lx: 170, ly: 22, sub: "load → increment → store (3 шага)", subCls: "vz-zsub heap", subY: 40 };
const STEPS_ZONES: Zone[] = [Z_STEPS];

// s2: Interlocked.Increment — one atomic op.
const Z_ATOMIC: Zone = { id: "atomic", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "Interlocked.Increment · ОДНА операция", labelCls: "vz-zlabel good sm", lx: 170, ly: 22, sub: "read-modify-write атомарно", subCls: "vz-zsub good", subY: 40 };
const ATOMIC_ZONES: Zone[] = [Z_ATOMIC];

// s3: Exchange returns previous.
const Z_BEFORE: Zone = { id: "before", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "БЫЛО", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "x = 5", subCls: "vz-zsub", subY: 47 };
const Z_AFTER: Zone = { id: "after", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Exchange(ref x, 10)", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "вернул старое 5, стало 10", subCls: "vz-zsub good", subY: 47 };
const EXCH_ZONES: Zone[] = [Z_BEFORE, Z_AFTER];

// s4: CompareExchange (CAS).
const Z_MATCH: Zone = { id: "match", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "СОВПАЛО", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "comparand == текущее → swap", subCls: "vz-zsub good", subY: 47 };
const Z_MISS: Zone = { id: "miss", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "НЕ СОВПАЛО", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "comparand ≠ → без изменений", subCls: "vz-zsub heap", subY: 47 };
const CAS_ZONES: Zone[] = [Z_MATCH, Z_MISS];

// s5 (SIGNATURE): 8 threads x 100000 -> 800000.
const Z_RACE7: Zone = { id: "race7", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "objCt++", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "потерянные обновления", subCls: "vz-zsub heap", subY: 47 };
const Z_LOCKFREE: Zone = { id: "lockfree", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Interlocked", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "8×100000 = 800000", subCls: "vz-zsub good", subY: 47 };
const LOCKFREE_ZONES: Zone[] = [Z_RACE7, Z_LOCKFREE];

export const interlocked: LessonData = {
  id: "CS.S8.interlocked",
  track: "CS",
  section: "CS.S8",
  module: "S8.7",
  lang: "csharp",
  title: "Interlocked: lock-free инкремент и CAS",
  kicker: "C# вглубь · S8 · атомарные операции",
  home: { subtitle: "атомарный ++, Exchange, CompareExchange (CAS)", icon: "async", estMinutes: 10 },
  prereqs: ["CS.S8.lock-statement"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-interlocked", kind: "doc", org: "Microsoft Learn", title: "Interlocked Class", url: "https://learn.microsoft.com/en-us/dotnet/api/system.threading.interlocked", date: "2026-01-20" },
    { id: "ms-best", kind: "doc", org: "Microsoft Learn", title: "Managed threading best practices", url: "https://learn.microsoft.com/en-us/dotnet/standard/threading/managed-threading-best-practices", date: "2026-03-13" },
  ],

  spec: [
    { text: "Проблема, которую решает: «On most computers, incrementing a variable is not an atomic operation, requiring the following steps: Load a value from an instance variable into a register. Increment or decrement the value. Store the value in the instance variable».", source: "ms-interlocked" },
    { text: "Атомарность инкремента: «The Increment and Decrement methods increment or decrement a variable and store the resulting value in a single operation».", source: "ms-interlocked" },
  ],
  edgeCases: [
    { text: "Exchange и CompareExchange: «The Exchange method atomically exchanges the values of the specified variables. The CompareExchange method combines two operations: comparing two values and storing a third value in one of the variables, based on the outcome of the comparison».", source: "ms-interlocked" },
    { text: "Не бросают и потокобезопасны: «The members of this class do not throw exceptions». Тип: «This type is thread safe».", source: "ms-interlocked" },
    { text: "Для простых состояний — быстрее lock: «the Interlocked class provides better performance for updates that must be atomic. Internally, it executes a single lock prefix if there is no contention».", source: "ms-best" },
  ],

  misconceptions: [
    {
      wrong: "objCt++ атомарен, а если нет — надо обязательно брать lock",
      hook: '<code>objCt++</code> — <b>не</b> атомарен: «On most computers, incrementing a variable is not an atomic operation, requiring the following steps: <span class="hl">Load a value… Increment or decrement… Store the value</span>». Вытеснение между шагами теряет обновление. Но <code>lock</code> тут избыточен: «<span class="hl">The Increment and Decrement methods increment or decrement a variable and store the resulting value in a single operation</span>» — атомарно и <b>без блокировки</b>. Есть ещё <code>Exchange</code> (атомарный swap) и <code>CompareExchange</code> — CAS, примитив под lock-free-алгоритмами: «combines two operations: comparing two values and storing a third value… <span class="hl">based on the outcome of the comparison</span>». И это дёшево: «the <code>Interlocked</code> class provides <span class="hl">better performance for updates that must be atomic</span>. Internally, it executes a single lock prefix if there is no contention». Дальше <b>пять разборов</b>: почему ++ не атомарен, атомарный Increment, Exchange, CompareExchange (CAS), и <b>машинная панель</b> — 8 потоков × 100000 = ровно 800000 реальным прогоном.',
      source: ["ms-interlocked", "ms-best"],
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Почему ++ не атомарен", title: "objCt++ = load → increment → store (три шага)",
      viewBox: "0 0 340 210", zones: STEPS_ZONES,
      code: ["objCt++;   // выглядит как одна операция, но это три:", "// 1) load value into register", "// 2) increment", "// 3) store back"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Шаг 1: «<span class="hl">Load a value from an instance variable into a register</span>». Значение уходит в регистр CPU.', nodes: [{ id: "l", kind: "gate", at: { zone: "steps", row: 0 }, state: "ok", label: "1. load", detail: "в регистр", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Шаг 2: «<span class="hl">Increment or decrement the value</span>» — в регистре. Оригинал в памяти ещё старый.', nodes: [{ id: "l", kind: "gate", at: { zone: "steps", row: 0 }, state: "ok", label: "1. load", detail: "в регистр" }, { id: "i", kind: "gate", at: { zone: "steps", row: 1, col: 0 }, state: "ok", label: "2. increment", detail: "в регистре", accent: true }], edges: [] },
        { codeLine: 3, out: "", caption: 'Шаг 3: «<span class="hl">Store the value in the instance variable</span>». Между 1–2 и 3 поток можно вытеснить → lost update.', nodes: [{ id: "l", kind: "gate", at: { zone: "steps", row: 0 }, state: "ok", label: "1. load", detail: "регистр" }, { id: "i", kind: "gate", at: { zone: "steps", row: 1, col: 0 }, state: "ok", label: "2. increment", detail: "регистр" }, { id: "s", kind: "gate", at: { zone: "steps", row: 1, col: 1 }, state: "fail", label: "3. store", detail: "тут вытеснят → потеря", accent: true }], edges: [] },
      ],
      explain: 'Interlocked существует ради одной вещи — сделать read-modify-write неделимым. «<span class="hl">On most computers, incrementing a variable is not an atomic operation, requiring the following steps: Load a value from an instance variable into a register. Increment or decrement the value. Store the value in the instance variable</span>». Дальше — механика гонки: «If you do not use <code>Increment</code> and <code>Decrement</code>… a thread can be preempted after executing the first two steps. Another thread can then execute all three steps. When the first thread resumes execution, it <span class="hl">overwrites the value in the instance variable</span>, and the effect of the increment or decrement performed by the second thread is lost». Это тот же lost-update из урока про managed threading, но здесь у него точечное лекарство — атомарные методы <code>Interlocked</code>.',
      sources: ["ms-interlocked"],
    },
    {
      id: "s2", num: "02", kicker: "Атомарный Increment", title: "Interlocked.Increment: три шага как одна операция",
      viewBox: "0 0 340 210", zones: ATOMIC_ZONES,
      code: ["Interlocked.Increment(ref counter);  // атомарно, без lock", "Interlocked.Decrement(ref counter);  // тоже атомарно", "Interlocked.Add(ref counter, 5);     // атомарный += для >1"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>Increment</code> делает все три шага <span class="hl">неделимо</span>: «increment or decrement a variable and store the resulting value in a single operation».', nodes: [{ id: "inc", kind: "gate", at: { zone: "atomic", row: 0 }, state: "ok", label: "Increment(ref counter)", detail: "load+inc+store = 1 атом", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Никакой поток не вклинится между load и store — вытеснение <span class="hl">не теряет</span> обновление. <code>Decrement</code> симметричен.', nodes: [{ id: "inc", kind: "gate", at: { zone: "atomic", row: 0 }, state: "ok", label: "Increment/Decrement", detail: "атомарно" }, { id: "no", kind: "gate", at: { zone: "atomic", row: 1 }, state: "ok", label: "нет lost update", detail: "неделимо", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Для инкремента больше 1 — <code>Add</code>: «<span class="hl">atomically adds an integer value to an integer variable and returns the new value</span>».', nodes: [{ id: "inc", kind: "gate", at: { zone: "atomic", row: 0 }, state: "ok", label: "Increment", detail: "+1" }, { id: "add", kind: "gate", at: { zone: "atomic", row: 1 }, state: "ok", label: "Add(ref, 5)", detail: "атомарный += , вернёт новое", accent: true }], edges: [] },
      ],
      explain: 'Лекарство от гонки инкремента: «<span class="hl">The Increment and Decrement methods increment or decrement a variable and store the resulting value in a single operation</span>». Для шагов больше 1: «The <code>Add</code> method <span class="hl">atomically adds an integer value to an integer variable and returns the new value of the variable</span>» (в best-practices прямо: «Use the <code>Add</code> method for atomic increments larger than 1»). Почему не всегда <code>lock</code>: «the <code>Interlocked</code> class provides <span class="hl">better performance for updates that must be atomic</span>. Internally, it <span class="hl">executes a single lock prefix if there is no contention</span>» — это аппаратная инструкция с префиксом <code>lock</code>, а не полновесная блокировка ОС. Бонус: «The members of this class <span class="hl">do not throw exceptions</span>», и «This type is thread safe».',
      sources: ["ms-interlocked", "ms-best"],
    },
    {
      id: "s3", num: "03", kicker: "Exchange · swap", title: "Interlocked.Exchange: атомарно меняет и возвращает старое",
      viewBox: "0 0 340 210", zones: EXCH_ZONES,
      code: ["int x = 5;", "int old = Interlocked.Exchange(ref x, 10);", "// old == 5 (прежнее), x == 10 (новое) — атомарно"],
      predictAt: 1, predictQ: '<code>int x = 5; int old = Interlocked.Exchange(ref x, 10);</code> — что за пара (old, x)?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Было <code>x = 5</code>. <code>Exchange</code> атомарно поставит новое значение и вернёт старое.', nodes: [{ id: "b", kind: "obj", at: { zone: "before", row: 0 }, typeTag: "x", value: "5", accent: true }], edges: [] },
        { codeLine: 1, out: "old=5 new=10", caption: '<code>Exchange(ref x, 10)</code>: «<span class="hl">Sets a 32-bit signed integer to a specified value and returns the original value</span>, as an atomic operation». Вернул <b>5</b>, x стал <b>10</b>.', nodes: [{ id: "b", kind: "obj", at: { zone: "before", row: 0 }, typeTag: "x", value: "5" }, { id: "a", kind: "gate", at: { zone: "after", row: 0 }, state: "ok", label: "Exchange → 5", detail: "x = 10", accent: true }], edges: [{ id: "e1", from: "b", to: "a", accent: true }] },
        { codeLine: 2, out: "", caption: 'Возврат <b>прежнего</b> — не мелочь: он говорит, «я точно перезаписал именно то значение». База для «взял/освободил» без lock (пример: 0↔1 как замок).', nodes: [{ id: "a", kind: "gate", at: { zone: "after", row: 0 }, state: "ok", label: "old = 5", detail: "атомарный swap", accent: true }], edges: [] },
      ],
      explain: 'Атомарный обмен: «<span class="hl">The Exchange method atomically exchanges the values of the specified variables</span>». Конкретно для <code>int</code>: «Sets a 32-bit signed integer to a specified value and <span class="hl">returns the original value</span>, as an atomic operation». Возврат прежнего значения делает <code>Exchange</code> строительным блоком lock-free-паттернов: в примере из доков переменная <code>usingResource</code> (0/1) служит замком без reentrancy — «<span class="hl">if(0 == Interlocked.Exchange(ref usingResource, 1))</span>»: атомарно поставили 1 и, если прежнее было 0, значит именно мы «захватили» ресурс. Есть перегрузки для <code>object</code>, <code>double</code>, <code>&lt;T&gt;</code> и т.д. — тип-безопасно и атомарно.',
      sources: ["ms-interlocked"],
    },
    {
      id: "s4", num: "04", kicker: "CompareExchange · CAS", title: "CAS: запиши, только если текущее == ожидаемому",
      viewBox: "0 0 340 210", zones: CAS_ZONES,
      code: ["int x = 7;", "int r1 = Interlocked.CompareExchange(ref x, 100, 7);  // comparand=7 совпал", "int r2 = Interlocked.CompareExchange(ref x, 200, 7);  // теперь x=100 ≠ 7", "// r1=7 x=100; r2=100 x=100 (не изменился)"],
      predictAt: 2, predictQ: '<code>x=7</code>; <code>CompareExchange(ref x,100,7)</code> вернёт r1 и оставит x=?; затем <code>CompareExchange(ref x,200,7)</code> вернёт r2 и оставит x=?', console: true,
      scenes: [
        { codeLine: 1, out: "", caption: 'CAS: «<span class="hl">Compares two 32-bit signed integers for equality and, if they are equal, replaces the first value</span>, as an atomic operation». comparand 7 == x → пишет 100, возвращает старое 7.', nodes: [{ id: "m", kind: "gate", at: { zone: "match", row: 0 }, state: "ok", label: "x==7 == comparand", detail: "swap → 100, r1=7", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Второй вызов: comparand всё ещё 7, но x уже 100 — <span class="hl">не совпало</span>. Значение <b>не меняется</b>, возвращает текущее 100.', nodes: [{ id: "m", kind: "gate", at: { zone: "match", row: 0 }, state: "ok", label: "1-й: совпал", detail: "→ 100" }, { id: "n", kind: "gate", at: { zone: "miss", row: 0 }, state: "fail", label: "2-й: 100 ≠ 7", detail: "без изменений, r2=100", accent: true }], edges: [] },
        { codeLine: 3, out: "r1=7 afterMatch=100 r2=100 afterMiss=100", caption: 'Реальный прогон: <b>r1=7 afterMatch=100 r2=100 afterMiss=100</b>. CAS — примитив <span class="hl">lock-free</span>: «попробуй записать, если никто не менял».', nodes: [{ id: "m", kind: "gate", at: { zone: "match", row: 0 }, state: "ok", label: "r1=7", detail: "x=100" }, { id: "n", kind: "gate", at: { zone: "miss", row: 0 }, state: "fail", label: "r2=100", detail: "x=100", accent: true }], edges: [] },
      ],
      explain: 'Compare-and-swap (CAS) — сердце lock-free-программирования: «<span class="hl">The CompareExchange method combines two operations: comparing two values and storing a third value in one of the variables, based on the outcome of the comparison. The compare and exchange operations are performed as an atomic operation</span>». Для <code>int</code>: «<span class="hl">Compares two 32-bit signed integers for equality and, if they are equal, replaces the first value</span>, as an atomic operation» — и всегда возвращает <b>исходное</b> значение первого аргумента. Реальный прогон: первый <code>CompareExchange(ref x, 100, 7)</code> при <code>x==7</code> совпал → x=100, вернул 7; второй с comparand 7 при <code>x==100</code> не совпал → x без изменений, вернул 100 (печать <b>r1=7 afterMatch=100 r2=100 afterMiss=100</b>). Практика best-practices: обновить ссылку только если она была null — «<span class="hl">Interlocked.CompareExchange(ref x, y, null)</span>» вместо double-checked lock. На CAS строят lock-free стеки, очереди, счётчики.',
      sources: ["ms-interlocked", "ms-best"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · без потерь", title: "8 потоков × 100000 Increment = ровно 800000",
      viewBox: "0 0 340 210", zones: LOCKFREE_ZONES,
      code: ["long counter = 0;  // 8 потоков", "each thread: for (j<100000) Interlocked.Increment(ref counter);", "foreach t.Join();  // counter == ?"],
      predictAt: 2, predictQ: '8 потоков, каждый <code>Interlocked.Increment</code> 100000 раз по общему <code>counter</code>; после <code>Join</code> всех — сколько?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'С обычным <code>counter++</code> из 8 потоков — <span class="hl">потерянные обновления</span>: итог меньше 800000 и непредсказуем.', nodes: [{ id: "r", kind: "gate", at: { zone: "race7", row: 0 }, state: "fail", label: "counter++", detail: "lost updates", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>Interlocked.Increment</code> — каждый инкремент <b>атомарен</b>: ни один не теряется, даже без lock.', nodes: [{ id: "r", kind: "gate", at: { zone: "race7", row: 0 }, state: "fail", label: "counter++", detail: "теряет" }, { id: "l", kind: "gate", at: { zone: "lockfree", row: 0 }, state: "ok", label: "Interlocked.Increment", detail: "атомарно", accent: true }], edges: [] },
        { codeLine: 2, out: "counter=800000", caption: 'Панель: <b>counter=800000</b> (реальный прогон) = 8 × 100000, <span class="hl">ровно</span> и воспроизводимо. Lock-free — и всё же детерминированно.', nodes: [{ id: "l", kind: "gate", at: { zone: "lockfree", row: 0 }, state: "ok", label: "Interlocked", detail: "без lock" }, { id: "res", kind: "gate", at: { zone: "lockfree", row: 1 }, state: "ok", label: "counter", detail: "800000", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — детерминизм атомарного счётчика. Прогон: 8 потоков, каждый делает <code>Interlocked.Increment(ref counter)</code> 100000 раз; после <code>Join</code> всех — ровно <b>800000</b> (= 8 × 100000), каждый раз одинаково. Именно это отличает <code>Interlocked</code> от гонки на <code>counter++</code>: «<span class="hl">The Increment and Decrement methods increment or decrement a variable and store the resulting value in a single operation</span>» → потерянных обновлений нет. Контраст с уроком про managed threading: там lost update «легко избежать методами класса <code>Interlocked</code>» — здесь мы это доказали числом. Вывод: для одиночных атомарных обновлений (счётчик, флаг, ссылка) бери <code>Interlocked</code>, а не <code>lock</code> — быстрее (один lock-префикс без contention) и не throws.',
      sources: ["ms-interlocked"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>long counter = 0; var threads = new Thread[8]; for (int i=0;i&lt;8;i++) threads[i]=new Thread(()=>{ for(int j=0;j&lt;100000;j++) Interlocked.Increment(ref counter); }); foreach(var t in threads) t.Start(); foreach(var t in threads) t.Join(); Console.WriteLine($"counter={counter}");</code> — что напечатает?',
      options: ["counter=800000", "counter=100000", "counter (меньше 800000, непредсказуемо)", "counter=8"], correctIndex: 0, xp: 10,
      okText: '<code>Interlocked.Increment</code> делает load+inc+store «in a single operation» — потерянных обновлений нет; 8 × 100000 = ровно <b>800000</b>, воспроизводимо, без <code>lock</code>.',
      noText: 'С обычным <code>counter++</code> итог был бы меньше и непредсказуем; атомарный Increment даёт точные <b>800000</b>. Реальный вывод: <b>counter=800000</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "counter=800000" }, sourceRefs: ["ms-interlocked"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>int x = 5; int old = Interlocked.Exchange(ref x, 10); Console.WriteLine($"old={old} new={x}");</code> — что напечатает?',
      options: ["old=5 new=10", "old=10 new=5", "old=10 new=10", "old=5 new=5"], correctIndex: 0, xp: 10,
      okText: '<code>Exchange</code> «Sets a 32-bit signed integer to a specified value and <b>returns the original value</b>» — вернул прежнее <b>5</b>, а <code>x</code> стал <b>10</b>. Атомарный swap.',
      noText: '<code>Exchange</code> возвращает СТАРОЕ значение (5) и записывает новое (10). Реальный вывод: <b>old=5 new=10</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "old=5 new=10" }, sourceRefs: ["ms-interlocked"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>int x = 7; int r1 = Interlocked.CompareExchange(ref x, 100, 7); int afterMatch = x; int r2 = Interlocked.CompareExchange(ref x, 200, 7); int afterMiss = x; Console.WriteLine($"r1={r1} afterMatch={afterMatch} r2={r2} afterMiss={afterMiss}");</code> — что напечатает?',
      options: ["r1=7 afterMatch=100 r2=100 afterMiss=100", "r1=7 afterMatch=100 r2=7 afterMiss=200", "r1=100 afterMatch=100 r2=200 afterMiss=200", "r1=7 afterMatch=7 r2=100 afterMiss=100"], correctIndex: 0, xp: 10,
      okText: 'CAS: 1-й — comparand 7 == x → пишет 100, возвращает старое 7 (afterMatch=100). 2-й — comparand 7 ≠ 100 → <span class="hl">не меняет</span>, возвращает текущее 100 (afterMiss=100).',
      noText: '<code>CompareExchange</code> заменяет, только если текущее == comparand, и всегда возвращает исходное. Реальный вывод: <b>r1=7 afterMatch=100 r2=100 afterMiss=100</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "r1=7 afterMatch=100 r2=100 afterMiss=100" }, sourceRefs: ["ms-interlocked"],
    },
  ],

  takeaways: [
    { icon: "why", k: "++ не атомарен", v: '«incrementing a variable is not an atomic operation, requiring… <span class="hl">Load a value… Increment or decrement the value… Store the value</span>» — вытеснение теряет обновление. <code>Interlocked.Increment</code> делает всё «<span class="hl">store the resulting value in a single operation</span>».' },
    { icon: "cost", k: "Exchange / CAS", v: '<code>Exchange</code> — атомарный swap, «returns the original value». <code>CompareExchange</code> — CAS: «comparing two values and storing a third value… <span class="hl">based on the outcome of the comparison</span>» (r1=7 afterMatch=100 r2=100). Примитив lock-free.' },
    { icon: "avoid", k: "vs lock", v: 'Для одиночных атомарных обновлений — <code>Interlocked</code>, не <code>lock</code>: «<span class="hl">better performance… executes a single lock prefix if there is no contention</span>», «do not throw exceptions», «thread safe». Панель: 8×100000 = 800000.' },
  ],

  foot: 'урок · <b>Interlocked: атомарные операции</b> · 5 анимир. разборов · панель 8×100000=800000 · дизайн <b>mid</b>',
};
