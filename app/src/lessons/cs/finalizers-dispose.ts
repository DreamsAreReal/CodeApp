/**
 * Lesson: Finalizers, IDisposable and the Dispose pattern (CS.S7.finalizers-dispose) — expert
 * density, 5 animated deep-dives. A finalizer (Object.Finalize / ~Type()) is a NON-deterministic
 * GC fallback: the type is added to the finalization queue, the GC calls it when the object becomes
 * inaccessible — but the exact time is undefined and it might not run at all; it needs at least two
 * garbage collections and the CLR finalizes reference types only. Dispose() is DETERMINISTIC cleanup
 * by the consumer; it must be idempotent. Canon: Dispose() -> Dispose(true) + GC.SuppressFinalize(this);
 * the disposing flag distinguishes Dispose (true) from the finalizer (false). Prefer a SafeHandle over
 * writing a finalizer; a finalizer is needed only when you directly own an unmanaged resource.
 *
 * SIGNATURE machine panel (s5): REAL measurements — GC.SuppressFinalize prevents the finalizer from
 * running (finalizerRan=False), and the disposing flag is true when Dispose(bool) is called from
 * Dispose() (disposingWhenCalledFromDispose=True). evidence/F13/finalizers-dispose-exec.txt.
 *
 * Accuracy contract (G7) — verified against implementing-dispose + Object.Finalize (fetch 2026-07-19)
 * + GT-M5-s7.md (LF F12..F23, MM11/MM12/MM13/MM14/MM15/MM16). NOTE: implementing-dispose is
 * ai-assisted; the timing / 2-GC / reference-types-only / not-guaranteed facts are cross-confirmed
 * verbatim on the Object.Finalize API page (ms-finalize).
 *   - every English quote is VERBATIM from the sources[] page it cites;
 *   - every card\'s verify.expect is the REAL stdout of run-csharp (evidence/F13/finalizers-dispose-exec.txt:
 *     "finalizerRan=False"; "disposeCount=1 idempotent=True"; "disposingWhenCalledFromDispose=True");
 *   - NO GT-M5 myths: MM11 (finalizer guaranteed to run) — no, exact time undefined, might not run at
 *     all; MM12 (Dispose == finalizer) — no, Dispose deterministic/consumer vs finalizer nondeterministic
 *     GC fallback (disposing flag); MM13 (SuppressFinalize frees resources) — no, only removes from the
 *     finalization queue, Dispose(true) frees; MM14 (finalizable object collected in one GC) — no, at
 *     least two; MM16 (finalizer on a value type) — no, CLR ignores finalizers on value types.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S7.finalizers-dispose/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: finalizer = nondeterministic GC fallback.
const Z_FIN: Zone = { id: "fin", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone heap", label: "ФИНАЛИЗАТОР · недетерминированный fallback GC", labelCls: "vz-zlabel heap", lx: 170, ly: 24, sub: "finalization queue · время undefined · может не выполниться", subCls: "vz-zsub heap", subY: 47 };
const FIN_ZONES: Zone[] = [Z_FIN];

// s2: Dispose = deterministic consumer cleanup.
const Z_DISP: Zone = { id: "disp", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Dispose() · детерминирован", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "зовёт потребитель · идемпотентен", subCls: "vz-zsub good", subY: 47 };
const Z_FALLBACK: Zone = { id: "fallback", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "финализатор · fallback", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "если Dispose забыли", subCls: "vz-zsub heap", subY: 47 };
const DISP_ZONES: Zone[] = [Z_DISP, Z_FALLBACK];

// s3: canonical pattern.
const Z_PATTERN: Zone = { id: "pattern", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "КАНОН · Dispose() → Dispose(true) + SuppressFinalize", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "disposing: true=из Dispose · false=из финализатора", subCls: "vz-zsub good", subY: 47 };
const PATTERN_ZONES: Zone[] = [Z_PATTERN];

// s4: SafeHandle recommendation.
const Z_SAFE: Zone = { id: "safe", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "SafeHandle (рекомендуется)", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "финализатор уже внутри", subCls: "vz-zsub good", subY: 47 };
const Z_OWN: Zone = { id: "own", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "свой финализатор", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "ТОЛЬКО прямое владение unmanaged", subCls: "vz-zsub", subY: 47 };
const SAFE_ZONES: Zone[] = [Z_SAFE, Z_OWN];

// s5 (SIGNATURE): real measurement.
const Z_SUPPR: Zone = { id: "suppr", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "SuppressFinalize", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "финализатор НЕ бежит", subCls: "vz-zsub good", subY: 47 };
const Z_FLAG: Zone = { id: "flag", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "disposing флаг", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "true из Dispose()", subCls: "vz-zsub good", subY: 47 };
const SIG_ZONES: Zone[] = [Z_SUPPR, Z_FLAG];

export const finalizersDispose: LessonData = {
  id: "CS.S7.finalizers-dispose",
  track: "CS",
  section: "CS.S7",
  module: "S7.6",
  lang: "csharp",
  title: "Финализаторы и Dispose: паттерн, SuppressFinalize",
  kicker: "C# вглубь · S7 · очистка ресурсов",
  home: { subtitle: "финализатор=fallback, Dispose pattern, SuppressFinalize, SafeHandle", icon: "gc", estMinutes: 10 },
  prereqs: ["CS.S7.gc-overview"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-dispose", kind: "doc", org: "Microsoft Learn", title: "Implement a Dispose method", url: "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose", date: "2025-10-22" },
    { id: "ms-finalize", kind: "doc", org: "Microsoft Learn", title: "Object.Finalize Method", url: "https://learn.microsoft.com/en-us/dotnet/api/system.object.finalize", date: "2025-07-01" },
  ],

  spec: [
    { text: "«The exact time when the finalizer executes is undefined. To ensure deterministic release of resources for instances of your class, implement a Close method or provide a IDisposable.Dispose implementation.» <span class=\"ru-tr\">«Точное время выполнения финализатора не определено. Чтобы гарантировать детерминированное освобождение ресурсов для экземпляров вашего класса, реализуйте метод Close или предоставьте реализацию IDisposable.Dispose.»</span>", source: "ms-finalize" },
  ],
  edgeCases: [
    { text: "Финализация дорогая (verbatim, Object.Finalize): «Reclaiming memory tends to take much longer if a finalization operation runs, because it <span class=\"hl\">requires at least two garbage collections</span>. … you should override the Finalize method for reference types only. The common language runtime only finalizes reference types. <b>It ignores finalizers on value types</b>». <span class=\"ru-tr\">«Освобождение памяти обычно занимает намного больше времени, если выполняется операция финализации, потому что она требует как минимум двух сборок мусора. … переопределять метод Finalize следует только для ссылочных типов. Среда CLR финализирует только ссылочные типы. <b>Она игнорирует финализаторы у значимых типов</b>».</span>", source: "ms-finalize" },
    { text: "Может не выполниться (verbatim): «The Finalize method <span class=\"hl\">might not run to completion or might not run at all</span>» <span class=\"ru-tr\">«Метод Finalize может не отработать до конца или не выполниться вообще»</span> — при блокировке другого финализатора или аварийном завершении процесса. Порядок и поток финализатора не гарантированы.", source: "ms-finalize" },
    { text: "SuppressFinalize (verbatim, Dispose): «the call to the SuppressFinalize method <span class=\"hl\">prevents the garbage collector from running the finalizer</span>. If the type has no finalizer, the call to GC.SuppressFinalize has no effect. <b>The actual cleanup is performed by the Dispose(bool) method overload</b>». <span class=\"ru-tr\">«вызов метода SuppressFinalize не даёт сборщику мусора запустить финализатор. Если у типа нет финализатора, вызов GC.SuppressFinalize не даёт эффекта. <b>Фактическая очистка выполняется перегрузкой метода Dispose(bool)</b>».</span>", source: "ms-dispose" },
  ],

  misconceptions: [
    {
      wrong: "финализатор гарантированно вызовется; Dispose — это то же, что финализатор; SuppressFinalize освобождает ресурсы",
      hook: 'Три мифа. «<span class="wrong">финализатор гарантированно вызовется</span>» — нет: «<span class="hl">The exact time when the finalizer executes is undefined</span>» <span class="ru-tr">«Точное время выполнения финализатора не определено»</span> и «might not run at all» <span class="ru-tr">«может не выполниться вообще»</span>. «<span class="wrong">Dispose = финализатор</span>» — нет: <code>Dispose()</code> <b>детерминирован</b> (зовёт потребитель), финализатор — недетерминированный fallback GC; различаются флагом <code>disposing</code>. «<span class="wrong">SuppressFinalize освобождает ресурсы</span>» — нет: он лишь снимает объект с финализации, «<span class="hl">The actual cleanup is performed by the Dispose(bool)</span>» <span class="ru-tr">«Фактическая очистка выполняется методом Dispose(bool)»</span>. Ниже <b>пять разборов</b>: финализатор как fallback, Dispose детерминирован, канон-паттерн (SuppressFinalize + disposing), SafeHandle вместо своего финализатора, и <b>машинная панель</b> — реальный замер.',
      source: "ms-finalize",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Финализатор · fallback", title: "Финализатор — недетерминированный fallback GC",
      viewBox: "0 0 340 210", zones: FIN_ZONES,
      code: ["class F { ~F() { /* финализатор (Object.Finalize) */ } }", "// тип с финализатором → в finalization queue", "// GC зовёт его, КОГДА объект недостижим — время undefined", "// может не выполниться вообще (блокировка / аварийный выход)"],
      scenes: [
        { codeLine: 1, caption: 'Для типа с финализатором (<code>~F()</code>) GC добавляет запись <span class="hl">на каждый экземпляр</span> в finalization queue — очередь объектов, чей финализатор должен отработать.', nodes: [{ id: "q", kind: "gate", at: { zone: "fin", row: 0 }, state: "ok", label: "finalization queue", detail: "запись на экземпляр", accent: true }], edges: [] },
        { codeLine: 2, caption: 'GC вызывает финализатор <b>автоматически</b>, когда объект недостижим — но <span class="hl">точное время undefined</span>.', nodes: [{ id: "q", kind: "gate", at: { zone: "fin", row: 0 }, state: "ok", label: "queue", detail: "недостижим → зовёт" }, { id: "t", kind: "gate", at: { zone: "fin", row: 1 }, state: "fail", label: "время", detail: "undefined", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Хуже: финализатор <span class="hl">может не выполниться вообще</span> (другой финализатор завис / аварийный выход процесса). Порядок и поток не гарантированы.', nodes: [{ id: "t", kind: "gate", at: { zone: "fin", row: 0 }, state: "fail", label: "undefined время" }, { id: "n", kind: "gate", at: { zone: "fin", row: 1 }, state: "fail", label: "might not run at all", detail: "не гарантирован", accent: true }], edges: [] },
      ],
      explain: 'Дословно (Object.Finalize): «If a type does override the <code>Finalize</code> method, the garbage collector <span class="hl">adds an entry for each instance of the type to an internal structure called the finalization queue</span>… The garbage collector then calls the <code>Finalize</code> method automatically when it discovers that an object is inaccessible». <span class="ru-tr">«Если тип переопределяет метод <code>Finalize</code>, сборщик мусора добавляет запись на каждый экземпляр типа во внутреннюю структуру, называемую очередью финализации… Затем сборщик мусора вызывает метод <code>Finalize</code> автоматически, когда обнаруживает, что объект недостижим».</span> Ограничения: «<span class="hl">The exact time when the finalizer executes is undefined</span>» <span class="ru-tr">«Точное время выполнения финализатора не определено»</span>; «The finalizers of two objects are not guaranteed to run in any specific order» <span class="ru-tr">«Финализаторы двух объектов не гарантированно выполняются в каком-либо определённом порядке»</span>; «The thread on which the finalizer runs is unspecified» <span class="ru-tr">«Поток, в котором выполняется финализатор, не определён»</span>; и «The <code>Finalize</code> method <span class="hl">might not run to completion or might not run at all</span>» <span class="ru-tr">«Метод <code>Finalize</code> может не отработать до конца или не выполниться вообще»</span> (если другой финализатор завис или процесс аварийно завершился). Вывод (анти-миф MM11/MM15): финализатор — это <b>недетерминированный fallback</b>, на который нельзя полагаться для своевременной очистки. Для детерминизма — <code>Dispose</code> (разбор 02).',
      sources: ["ms-finalize"],
    },
    {
      id: "s2", num: "02", kicker: "Dispose · детерминизм", title: "Dispose() — детерминированная очистка от потребителя",
      viewBox: "0 0 340 210", zones: DISP_ZONES,
      code: ["using (var r = new Resource()) { ... }  // Dispose() зовёт ПОТРЕБИТЕЛЬ, детерминированно", "r.Dispose(); r.Dispose();               // идемпотентен — повторный вызов = no-op", "// финализатор остаётся как fallback, если Dispose ЗАБЫЛИ"],
      scenes: [
        { codeLine: 0, caption: '<code>Dispose()</code> зовёт <span class="hl">потребитель</span> (напр. <code>using</code>) — детерминированно, ровно тогда, когда ресурс больше не нужен.', nodes: [{ id: "d", kind: "gate", at: { zone: "disp", row: 0 }, state: "ok", label: "Dispose()", detail: "потребитель зовёт", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>Dispose</code> должен быть <span class="hl">идемпотентен</span>: «callable multiple times without throwing» <span class="ru-tr">«вызываемым несколько раз без выброса исключения»</span>, повторные вызовы «do nothing» <span class="ru-tr">«ничего не делают»</span>.', nodes: [{ id: "d", kind: "gate", at: { zone: "disp", row: 0 }, state: "ok", label: "Dispose × N", detail: "идемпотентен" }, { id: "i", kind: "gate", at: { zone: "disp", row: 1 }, state: "ok", label: "2-й вызов", detail: "no-op", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Финализатор (если есть) — <span class="hl">fallback</span> на случай, если <code>Dispose</code> забыли вызвать. Оба вызывают общий <code>Dispose(bool)</code>.', nodes: [{ id: "d", kind: "gate", at: { zone: "disp", row: 0 }, state: "ok", label: "Dispose", detail: "детерминизм" }, { id: "f", kind: "gate", at: { zone: "fallback", row: 0 }, state: "fail", label: "финализатор", detail: "fallback", accent: true }], edges: [] },
      ],
      explain: 'Дословно (implementing-dispose): «Because the <code>public</code>, non-virtual … parameterless <code>Dispose</code> method is <span class="hl">called when it\'s no longer needed (by a consumer of the type)</span>, its purpose is to free unmanaged resources, perform general cleanup, and to indicate that the finalizer, if one is present, doesn\'t have to run». <span class="ru-tr">«Поскольку <code>public</code>, невиртуальный … беспараметрический метод <code>Dispose</code> вызывается, когда он больше не нужен (потребителем типа), его назначение — освободить неуправляемые ресурсы, выполнить общую очистку и показать, что финализатору, если он есть, выполняться не обязательно».</span> И про идемпотентность: «a <code>Dispose</code> method <span class="hl">should be idempotent, such that it\'s callable multiple times without throwing an exception. Furthermore, subsequent invocations of <code>Dispose</code> should do nothing</span>». <span class="ru-tr">«метод <code>Dispose</code> должен быть идемпотентным, чтобы его можно было вызывать несколько раз без выброса исключения. Более того, последующие вызовы <code>Dispose</code> должны ничего не делать».</span> Ключевое различие (анти-миф MM12): <code>Dispose</code> — <b>детерминированная</b> очистка от потребителя (ты знаешь, когда); финализатор — <b>недетерминированный</b> fallback от GC (ты не знаешь, когда и выполнится ли). Замер (панель): повторный <code>Dispose</code> не бросает и делает no-op.',
      sources: ["ms-dispose"],
    },
    {
      id: "s3", num: "03", kicker: "Канон-паттерн", title: "Dispose() → Dispose(true) + SuppressFinalize; флаг disposing",
      viewBox: "0 0 340 210", zones: PATTERN_ZONES,
      code: ["public void Dispose() { Dispose(true); GC.SuppressFinalize(this); }", "protected virtual void Dispose(bool disposing) {", "  if (disposing) { /* managed-ресурсы */ }  // disposing: true=из Dispose, false=из финализатора", "  /* unmanaged-ресурсы — всегда */ }"],
      scenes: [
        { codeLine: 0, caption: 'Публичный <code>Dispose()</code>: зовёт <code>Dispose(true)</code>, затем <span class="hl"><code>GC.SuppressFinalize(this)</code></span> — «финализатору не нужно бежать».', nodes: [{ id: "p", kind: "gate", at: { zone: "pattern", row: 0 }, state: "ok", label: "Dispose()", detail: "Dispose(true)+Suppress", accent: true }], edges: [] },
        { codeLine: 2, caption: '<code>Dispose(bool disposing)</code>: флаг <span class="hl">disposing = true</span> когда вызвано из <code>Dispose</code>, <span class="hl">false</span> — из финализатора.', nodes: [{ id: "p", kind: "gate", at: { zone: "pattern", row: 0 }, state: "ok", label: "Dispose(bool)", detail: "флаг disposing" }, { id: "f", kind: "gate", at: { zone: "pattern", row: 1 }, state: "ok", label: "true / false", detail: "Dispose / финализатор", accent: true }], edges: [] },
        { codeLine: 3, caption: 'При <code>disposing==true</code> чистим и managed, и unmanaged; при <code>false</code> (из финализатора) — <span class="hl">только unmanaged</span> (managed-объекты могли уже быть собраны).', nodes: [{ id: "p", kind: "gate", at: { zone: "pattern", row: 0 }, state: "ok", label: "true", detail: "managed+unmanaged" }, { id: "u", kind: "gate", at: { zone: "pattern", row: 1 }, state: "ok", label: "false", detail: "только unmanaged", accent: true }], edges: [] },
      ],
      explain: 'Канонический паттерн (implementing-dispose, verbatim). Публичный метод: <code>public void Dispose() { Dispose(true); GC.SuppressFinalize(this); }</code>, где «the call to the <span class="hl">SuppressFinalize</span> method prevents the garbage collector from running the finalizer. … The actual cleanup is performed by the <code>Dispose(bool)</code> method overload». <span class="ru-tr">«вызов метода SuppressFinalize не даёт сборщику мусора запустить финализатор. … Фактическая очистка выполняется перегрузкой метода <code>Dispose(bool)</code>».</span> Флаг: «the <code>disposing</code> parameter is a <code>Boolean</code> that indicates whether the method call comes from a <code>Dispose</code> method (<span class="hl">its value is <code>true</code></span>) or from a finalizer (<span class="hl">its value is <code>false</code></span>)… it is <code>true</code> when deterministically called and <code>false</code> when nondeterministically called». <span class="ru-tr">«параметр <code>disposing</code> — это <code>Boolean</code>, который указывает, исходит ли вызов метода из метода <code>Dispose</code> (его значение <code>true</code>) или из финализатора (его значение <code>false</code>)… он равен <code>true</code> при детерминированном вызове и <code>false</code> при недетерминированном».</span> Логика (анти-миф MM13): <code>SuppressFinalize</code> лишь снимает объект с финализации; освобождает — <code>Dispose(bool)</code>. При <code>false</code> трогать managed-объекты нельзя — «the order in which the garbage collector disposes managed objects during finalization is nondeterministic». <span class="ru-tr">«порядок, в котором сборщик мусора освобождает управляемые объекты во время финализации, недетерминирован».</span>',
      sources: ["ms-dispose"],
    },
    {
      id: "s4", num: "04", kicker: "SafeHandle", title: "SafeHandle вместо своего финализатора",
      viewBox: "0 0 340 210", zones: SAFE_ZONES,
      code: ["// РЕКОМЕНДУЕТСЯ: обернуть unmanaged-ресурс в SafeHandle", "// SafeHandle сам предоставляет финализатор — свой писать не надо", "// свой финализатор нужен ТОЛЬКО при ПРЯМОМ владении unmanaged-ресурсом"],
      scenes: [
        { codeLine: 0, caption: 'Microsoft рекомендует <span class="hl">обернуть unmanaged-ресурс в <code>SafeHandle</code></span> вместо написания собственного финализатора.', nodes: [{ id: "s", kind: "gate", at: { zone: "safe", row: 0 }, state: "ok", label: "SafeHandle", detail: "wrap unmanaged", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>SafeHandle</code> <span class="hl">сам предоставляет финализатор</span> — освобождение ровно один раз, безопасно, без своего кода финализации.', nodes: [{ id: "s", kind: "gate", at: { zone: "safe", row: 0 }, state: "ok", label: "SafeHandle", detail: "финализатор внутри" }, { id: "o", kind: "gate", at: { zone: "safe", row: 1 }, state: "ok", label: "release once", detail: "надёжно", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Свой финализатор нужен <span class="hl">ТОЛЬКО при прямом владении</span> unmanaged-ресурсом — это «This is a highly advanced scenario that can be typically avoided» <span class="ru-tr">«Это очень продвинутый сценарий, которого обычно можно избежать»</span>.', nodes: [{ id: "s", kind: "gate", at: { zone: "safe", row: 0 }, state: "ok", label: "SafeHandle", detail: "по умолчанию" }, { id: "w", kind: "gate", at: { zone: "own", row: 0 }, state: "fail", label: "свой финализатор", detail: "только прямой unmanaged", accent: true }], edges: [] },
      ],
      explain: 'Рекомендация (implementing-dispose + Object.Finalize, verbatim): «we recommend that you <span class="hl">construct <code>System.Runtime.InteropServices.SafeHandle</code> objects instead of implementing a finalizer</span>». <span class="ru-tr">«мы рекомендуем создавать объекты <code>System.Runtime.InteropServices.SafeHandle</code> вместо реализации финализатора».</span> И жёстко про необходимость финализатора: «A finalizer (a <code>Object.Finalize</code> override) is <span class="hl">only required if you directly reference unmanaged resources</span>. This is a highly advanced scenario that can be typically avoided». <span class="ru-tr">«Финализатор (переопределение <code>Object.Finalize</code>) нужен только если вы напрямую ссылаетесь на неуправляемые ресурсы. Это очень продвинутый сценарий, которого обычно можно избежать».</span> Почему <code>SafeHandle</code>: он «provides a finalizer so you don\'t have to write one yourself» <span class="ru-tr">«предоставляет финализатор, так что вам не нужно писать его самостоятельно»</span> и гарантирует освобождение ресурса ровно один раз. Практика: если класс держит только managed-объекты — финализатор не нужен вовсе (реализуй только dispose-паттерн); если есть unmanaged — заверни его в <code>SafeHandle</code> (<code>SafeFileHandle</code>, <code>SafeRegistryHandle</code> и т.д.). Свой финализатор — крайний случай прямого владения.',
      sources: ["ms-dispose", "ms-finalize"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный замер", title: "SuppressFinalize и флаг disposing — на числах",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["GC.SuppressFinalize(f);  // → финализатор f НЕ выполнится", "// Dispose() → Dispose(true): disposing == true", "// (2 GC на финализацию, reference-types-only — факты из доки)"],
      predictAt: 1, predictQ: 'После <code>GC.SuppressFinalize(f)</code> выполнится ли финализатор <code>f</code>? И какой <code>disposing</code>, когда <code>Dispose(bool)</code> вызван из <code>Dispose()</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>GC.SuppressFinalize(f)</code> снимает <code>f</code> с финализации → его финализатор <span class="hl">не выполнится</span> (замер: finalizerRan=False).', nodes: [{ id: "s", kind: "gate", at: { zone: "suppr", row: 0 }, state: "ok", label: "SuppressFinalize", detail: "finalizerRan=False", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Канон <code>Dispose() → Dispose(true)</code> → флаг <span class="hl"><code>disposing == true</code></span> (детерминированный вызов).', nodes: [{ id: "s", kind: "gate", at: { zone: "suppr", row: 0 }, state: "ok", label: "Suppress", detail: "False" }, { id: "f", kind: "gate", at: { zone: "flag", row: 0 }, state: "ok", label: "disposing", detail: "True", accent: true }], edges: [] },
        { codeLine: 2, out: "finalizerRan=False · disposingWhenCalledFromDispose=True", caption: 'Панель: <b>finalizerRan=False</b> (SuppressFinalize сработал, 3/3) и <b>disposingWhenCalledFromDispose=True</b> (3/3). Финализация «requires at least two garbage collections» <span class="ru-tr">«требует как минимум двух сборок мусора»</span>, reference-types-only — из доки (не runnable).', nodes: [{ id: "s", kind: "gate", at: { zone: "suppr", row: 0 }, state: "ok", label: "finalizerRan", detail: "False" }, { id: "f", kind: "gate", at: { zone: "flag", row: 0 }, state: "ok", label: "disposing", detail: "True", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — механика SuppressFinalize и флага disposing, снятая в рантайме. (1) <b>SuppressFinalize</b>: у объекта с финализатором вызов <code>GC.SuppressFinalize(f)</code> убирает его из очереди финализации → финализатор НЕ бежит после сбора: замер <code>finalizerRan=False</code> (3/3), ровно как «prevents the garbage collector from running the finalizer» <span class="ru-tr">«не даёт сборщику мусора запустить финализатор»</span>. (2) <b>disposing</b>: канон <code>Dispose() → Dispose(true)</code> передаёт <code>disposing = true</code> (детерминированный путь) — замер <code>disposingWhenCalledFromDispose=True</code> (3/3); из финализатора было бы <code>false</code>. Две вещи оставлены как <b>Learn-факты</b>, а не runnable-карты, потому что недетерминированы во времени: «requires at least two garbage collections» <span class="ru-tr">«требует как минимум двух сборок мусора»</span> (финализируемый объект собирается минимум за 2 GC) и «The common language runtime only finalizes reference types. It ignores finalizers on value types» <span class="ru-tr">«Среда CLR финализирует только ссылочные типы. Она игнорирует финализаторы у значимых типов»</span>. Числа панели реальны; недетерминированные факты честно помечены как цитаты доки.',
      sources: ["ms-dispose", "ms-finalize"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>class F { public static int finalized=0; ~F(){ finalized++; } } var f = new F(); GC.SuppressFinalize(f); f = null; GC.Collect(); GC.WaitForPendingFinalizers(); GC.Collect(); Console.WriteLine($"finalizerRan={F.finalized>0}");</code> — что напечатает?',
      options: ["finalizerRan=False", "finalizerRan=True", "0", "(исключение)"], correctIndex: 0, xp: 10,
      okText: '<code>GC.SuppressFinalize(f)</code> снимает <code>f</code> с финализации → финализатор <span class="hl">не выполнится</span> даже после сбора. Печать: <b>finalizerRan=False</b>. (SuppressFinalize снимает с очереди, не «освобождает ресурсы» — это делает Dispose.)',
      noText: '«SuppressFinalize… prevents the garbage collector from running the finalizer». <span class="ru-tr">«SuppressFinalize… не даёт сборщику мусора запустить финализатор».</span> Реальный вывод: <b>finalizerRan=False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "finalizerRan=False" }, sourceRefs: ["ms-dispose"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>class R : IDisposable { bool d; public int count; public void Dispose(){ if(d) return; d=true; count++; } } var r = new R(); r.Dispose(); r.Dispose(); r.Dispose(); Console.WriteLine($"disposeCount={r.count} idempotent={r.count==1}");</code> — что напечатает?',
      options: ["disposeCount=1 idempotent=True", "disposeCount=3 idempotent=False", "disposeCount=0 idempotent=False", "(исключение)"], correctIndex: 0, xp: 10,
      okText: '<code>Dispose</code> <span class="hl">идемпотентен</span>: «callable multiple times without throwing an exception. Furthermore, subsequent invocations of Dispose should do nothing». <span class="ru-tr">«вызываемым несколько раз без выброса исключения. Более того, последующие вызовы Dispose должны ничего не делать».</span> Три вызова → работа один раз. Печать: <b>disposeCount=1 idempotent=True</b>.',
      noText: 'Повторный <code>Dispose</code> — no-op, без исключения. Реальный вывод: <b>disposeCount=1 idempotent=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "disposeCount=1 idempotent=True" }, sourceRefs: ["ms-dispose"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>class R : IDisposable { public bool? disposingSeen; public void Dispose(){ Dispose(true); GC.SuppressFinalize(this); } protected virtual void Dispose(bool disposing){ disposingSeen = disposing; } } var r = new R(); r.Dispose(); Console.WriteLine($"disposingWhenCalledFromDispose={r.disposingSeen}");</code> — что напечатает?',
      options: ["disposingWhenCalledFromDispose=True", "disposingWhenCalledFromDispose=False", "disposingWhenCalledFromDispose=", "(исключение)"], correctIndex: 0, xp: 10,
      okText: 'Канон <code>Dispose() → Dispose(true)</code>: флаг <code>disposing</code> = <span class="hl">true</span> при вызове из <code>Dispose</code> (детерминированно). Из финализатора было бы <code>false</code>. Печать: <b>disposingWhenCalledFromDispose=True</b>.',
      noText: 'disposing: true=из Dispose, false=из финализатора. Реальный вывод: <b>disposingWhenCalledFromDispose=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "disposingWhenCalledFromDispose=True" }, sourceRefs: ["ms-dispose"],
    },
  ],

  takeaways: [
    { icon: "why", k: "финализатор = fallback", v: 'Финализатор недетерминирован: «<span class="hl">exact time… undefined</span>» <span class="ru-tr">«точное время… не определено»</span>, «might not run at all» <span class="ru-tr">«может не выполниться вообще»</span>, порядок/поток не гарантированы, <b>≥2 GC</b> на сбор, только reference-типы (CLR «ignores finalizers on value types» <span class="ru-tr">«игнорирует финализаторы у значимых типов»</span>). Не полагайся на него для своевременной очистки.' },
    { icon: "cost", k: "Dispose ≠ финализатор", v: '<code>Dispose()</code> — <span class="hl">детерминированная</span> очистка от потребителя, идемпотентна (замер: 3 вызова = работа 1 раз). Финализатор — недетерминированный fallback GC. Различает флаг <code>disposing</code> (true из Dispose — замер, false из финализатора).' },
    { icon: "avoid", k: "паттерн + SafeHandle", v: 'Канон: <code>Dispose() → Dispose(true) + GC.SuppressFinalize(this)</code>. <code>SuppressFinalize</code> лишь <span class="hl">снимает с финализации</span> (замер: finalizerRan=False), освобождает <code>Dispose(true)</code>. Вместо своего финализатора — <b>SafeHandle</b> (финализатор нужен только при прямом владении unmanaged).' },
  ],

  foot: 'урок · <b>финализаторы и Dispose</b> · 5 анимир. разборов · панель реального замера (SuppressFinalize, disposing) · дизайн <b>mid</b>',
};
