/**
 * Lesson: Weak references — WeakReference, short vs long, reestablishing a strong ref
 * (CS.S7.weak-references) — expert density, 5 animated deep-dives. A weak reference PERMITS the GC
 * to collect the object while still allowing the application to access it — so, unlike a strong
 * reference, it does NOT prevent collection. You can reestablish a strong reference by casting the
 * Target property (null => collected), but there is a race: the GC may get to the object first. A
 * SHORT weak reference (parameterless ctor) has its Target become null when the object is collected;
 * a LONG weak reference (second ctor arg true) is retained after Finalize has been called (to track
 * resurrection), but the object\'s state is then unpredictable.
 *
 * SIGNATURE machine panel (s5): REAL measurements — a weak reference does not prevent collection
 * (beforeGC=True afterGC=False), a materialized strong reference does (strongRefKeepsAlive=True), and
 * short vs long is distinguished by TrackResurrection (False/True).
 * evidence/F13/weak-references-exec.txt.
 *
 * Accuracy contract (G7) — verified against garbage-collection/weak-references (fetch 2026-07-19) +
 * GT-M5-s7.md (LF F24..F29, MM17/MM18).
 *   - every English quote is VERBATIM from the weak-references page it cites;
 *   - every card\'s verify.expect is the REAL stdout of run-csharp (evidence/F13/weak-references-exec.txt:
 *     "beforeGC=True afterGC=False"; "strongRefKeepsAlive=True"; "shortTracksResurrection=False longTracksResurrection=True");
 *   - NO GT-M5 myths: MM17 (weak reference prevents collection) — no, it PERMITS collection (only a
 *     strong reference prevents it); MM18 (long weak reference keeps the object alive) — no, it only
 *     tracks the object through finalization, it doesn\'t prevent collection.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S7.weak-references/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: weak ref permits collection.
const Z_STRONG: Zone = { id: "strong", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "strong reference", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "МЕШАЕТ сбору · жив", subCls: "vz-zsub heap", subY: 47 };
const Z_WEAK: Zone = { id: "weak", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "weak reference", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "ПОЗВОЛЯЕТ сбор · доступ остаётся", subCls: "vz-zsub good", subY: 47 };
const REF_ZONES: Zone[] = [Z_STRONG, Z_WEAK];

// s2: reestablish strong ref via Target.
const Z_TARGET: Zone = { id: "target", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "cast Target", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "не null → снова strong", subCls: "vz-zsub good", subY: 47 };
const Z_RACE: Zone = { id: "race", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "гонка с GC", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "GC мог успеть первым → null", subCls: "vz-zsub heap", subY: 47 };
const TARGET_ZONES: Zone[] = [Z_TARGET, Z_RACE];

// s3: short weak reference.
const Z_SHORT: Zone = { id: "short", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "SHORT weak reference", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "Target → null при сборе · parameterless ctor", subCls: "vz-zsub good", subY: 47 };
const SHORT_ZONES: Zone[] = [Z_SHORT];

// s4: long weak reference + guidelines.
const Z_LONG: Zone = { id: "long", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "LONG weak reference", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "хранится после Finalize · ctor true", subCls: "vz-zsub", subY: 47 };
const Z_GUIDE: Zone = { id: "guide", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "guidelines", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "не мелким · не вместо кэша", subCls: "vz-zsub heap", subY: 47 };
const LONG_ZONES: Zone[] = [Z_LONG, Z_GUIDE];

// s5 (SIGNATURE): real measurement.
const Z_ALLOWS: Zone = { id: "allows", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "weak → сбор ОК", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "afterGC=False", subCls: "vz-zsub good", subY: 47 };
const Z_KIND: Zone = { id: "kind", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "short vs long", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "TrackResurrection", subCls: "vz-zsub good", subY: 47 };
const SIG_ZONES: Zone[] = [Z_ALLOWS, Z_KIND];

export const weakReferences: LessonData = {
  id: "CS.S7.weak-references",
  track: "CS",
  section: "CS.S7",
  module: "S7.7",
  lang: "csharp",
  title: "Weak references: short/long, Target, resurrection",
  kicker: "C# вглубь · S7 · слабые ссылки",
  home: { subtitle: "weak ref разрешает сбор, short/long, Target", icon: "gc", estMinutes: 10 },
  prereqs: ["CS.S7.gc-overview"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-weak", kind: "doc", org: "Microsoft Learn", title: "Weak References", url: "https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/weak-references", date: "2017-03-30" },
  ],

  spec: [
    { text: "«A weak reference permits the garbage collector to collect the object while still allowing the application to access the object.» <span class=\"ru-tr\">«Слабая ссылка позволяет сборщику мусора собрать объект, при этом по-прежнему давая приложению доступ к объекту.»</span>", source: "ms-weak" },
  ],
  edgeCases: [
    { text: "Восстановление strong ref (verbatim): «<span class=\"hl\">the application can still obtain a strong reference to the object, which prevents it from being collected</span>. However, there is always the risk that the garbage collector will get to the object first before a strong reference is reestablished». <span class=\"ru-tr\">«приложение всё ещё может получить сильную ссылку на объект, что предотвращает его сбор. Однако всегда есть риск, что сборщик мусора доберётся до объекта первым, прежде чем сильная ссылка будет восстановлена».</span>", source: "ms-weak" },
    { text: "Short (verbatim): «The target of a short weak reference <span class=\"hl\">becomes <code>null</code> when the object is reclaimed by garbage collection</span>. … A short weak reference is the parameterless constructor for <code>WeakReference</code>». <span class=\"ru-tr\">«Цель короткой слабой ссылки становится <code>null</code>, когда объект освобождается сборкой мусора. … Короткая слабая ссылка — это конструктор без параметров для <code>WeakReference</code>».</span>", source: "ms-weak" },
    { text: "Long (verbatim): «A long weak reference is <span class=\"hl\">retained after the object\'s <code>Finalize</code> method has been called</span>. This allows the object to be recreated, but the <b>state of the object remains unpredictable</b>. To use a long reference, specify <code>true</code> in the <code>WeakReference</code> constructor». <span class=\"ru-tr\">«Длинная слабая ссылка сохраняется после того, как был вызван метод <code>Finalize</code> объекта. Это позволяет пересоздать объект, но <b>состояние объекта остаётся непредсказуемым</b>. Чтобы использовать длинную ссылку, укажите <code>true</code> в конструкторе <code>WeakReference</code>».</span>", source: "ms-weak" },
  ],

  misconceptions: [
    {
      wrong: "weak reference предотвращает сбор объекта; long weak reference держит объект живым",
      hook: 'Два мифа наизнанку. «<span class="wrong">weak reference предотвращает сбор</span>» — <b>наоборот</b>: «A weak reference <span class="hl">permits the garbage collector to collect the object</span> while still allowing the application to access the object». <span class="ru-tr">«Слабая ссылка позволяет сборщику мусора собрать объект, при этом по-прежнему давая приложению доступ к объекту».</span> Предотвращает сбор только <b>strong</b> reference. «<span class="wrong">long weak reference держит объект живым</span>» — нет: она лишь «retained after… <code>Finalize</code>… has been called» <span class="ru-tr">«сохраняется после… вызова <code>Finalize</code>…»</span> (отследить resurrection), не мешая сбору. Ниже <b>пять разборов</b>: weak разрешает сбор, восстановление strong-ссылки (гонка), short (Target→null), long (после Finalize) + guidelines, и <b>машинная панель</b> — реальный замер.',
      source: "ms-weak",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Weak разрешает сбор", title: "Weak reference ПОЗВОЛЯЕТ сбор (в отличие от strong)",
      viewBox: "0 0 340 210", zones: REF_ZONES,
      code: ["object o = new(); // strong reference — GC НЕ может собрать, пока достижим", "var wr = new WeakReference(o); o = null; // теперь только weak", "// weak reference ПОЗВОЛЯЕТ GC собрать объект, но даёт к нему доступ"],
      scenes: [
        { codeLine: 0, caption: 'Пока есть <span class="hl">strong reference</span>, GC не может собрать объект — «The application is said to have a strong reference». <span class="ru-tr">«Говорят, что приложение имеет сильную ссылку».</span>', nodes: [{ id: "s", kind: "gate", at: { zone: "strong", row: 0 }, state: "fail", label: "strong ref", detail: "GC не тронет", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Weak reference — <b>наоборот</b>: «<span class="hl">permits the garbage collector to collect the object</span> while still allowing the application to access» <span class="ru-tr">«позволяет сборщику мусора собрать объект, при этом по-прежнему давая приложению доступ»</span> его.', nodes: [{ id: "s", kind: "gate", at: { zone: "strong", row: 0 }, state: "fail", label: "strong", detail: "мешает" }, { id: "w", kind: "gate", at: { zone: "weak", row: 0 }, state: "ok", label: "weak ref", detail: "разрешает сбор", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Смысл: объекты, что <span class="hl">много памяти</span>, но легко пересоздаются, — держи через weak, чтобы GC мог их забрать под давлением.', nodes: [{ id: "w", kind: "gate", at: { zone: "weak", row: 0 }, state: "ok", label: "weak", detail: "recreate if reclaimed" }, { id: "m", kind: "gate", at: { zone: "weak", row: 1 }, state: "ok", label: "экономия памяти", detail: "GC решает", accent: true }], edges: [] },
      ],
      explain: 'Суть weak reference (verbatim, анти-миф MM17): «The garbage collector cannot collect an object in use by an application while the application\'s code can reach that object. The application is said to have a <b>strong reference</b> to the object. <span class="hl">A weak reference permits the garbage collector to collect the object while still allowing the application to access the object</span>. A weak reference is valid only during the indeterminate amount of time until the object is collected when no strong references exist». <span class="ru-tr">«Сборщик мусора не может собрать объект, используемый приложением, пока код приложения может добраться до этого объекта. Говорят, что приложение имеет <b>сильную ссылку</b> на объект. Слабая ссылка позволяет сборщику мусора собрать объект, при этом по-прежнему давая приложению доступ к объекту. Слабая ссылка действительна только в течение неопределённого промежутка времени, пока объект не будет собран, когда сильных ссылок не существует».</span> То есть weak ≠ «удержать»: она <b>разрешает</b> сбор (в этом её смысл), сохраняя возможность достать объект, пока GC до него не добрался. Применение (verbatim): «Weak references are useful for objects that use a lot of memory, but can be recreated easily if they are reclaimed by garbage collection» <span class="ru-tr">«Слабые ссылки полезны для объектов, которые используют много памяти, но могут быть легко пересозданы, если освобождаются сборкой мусора»</span> — например, тяжёлое дерево в UI, которое дешевле пересоздать, чем держать всегда.',
      sources: ["ms-weak"],
    },
    {
      id: "s2", num: "02", kicker: "Восстановление · гонка", title: "Через Target можно вернуть strong ref — но есть гонка с GC",
      viewBox: "0 0 340 210", zones: TARGET_ZONES,
      code: ["var obj = wr.Target as Tree;  // приводим Target к типу", "if (obj != null) { /* объект жив → снова strong, работаем с obj */ }", "else { /* Target == null → объект уже собран, пересоздаём */ }"],
      scenes: [
        { codeLine: 0, caption: 'Чтобы вернуть strong ref, <span class="hl">приводим <code>Target</code></span> к типу объекта. Если <code>Target != null</code> — объект ещё жив.', nodes: [{ id: "t", kind: "gate", at: { zone: "target", row: 0 }, state: "ok", label: "wr.Target as T", detail: "не null → strong", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Получив не-null — приложение <span class="hl">снова имеет strong ref</span>, «which prevents it from being collected». <span class="ru-tr">«что предотвращает его сбор».</span> Работаем с полученной ссылкой.', nodes: [{ id: "t", kind: "gate", at: { zone: "target", row: 0 }, state: "ok", label: "obj != null", detail: "regained strong" }, { id: "u", kind: "gate", at: { zone: "target", row: 1 }, state: "ok", label: "use obj", detail: "жив", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Но есть <span class="hl">гонка</span>: «the garbage collector will get to the object first» <span class="ru-tr">«сборщик мусора доберётся до объекта первым»</span> → <code>Target == null</code>, объект собран, надо пересоздать.', nodes: [{ id: "t", kind: "gate", at: { zone: "target", row: 0 }, state: "ok", label: "Target", detail: "проверка" }, { id: "r", kind: "gate", at: { zone: "race", row: 0 }, state: "fail", label: "GC успел", detail: "Target == null", accent: true }], edges: [] },
      ],
      explain: 'Восстановление strong-ссылки (verbatim): «To establish a strong reference and use the object again, <span class="hl">cast the <code>Target</code> property of a <code>WeakReference</code> to the type of the object. If the <code>Target</code> property returns <code>null</code>, the object was collected</span>; otherwise, you can continue to use the object because the application has regained a strong reference to it». <span class="ru-tr">«Чтобы установить сильную ссылку и снова использовать объект, приведите свойство <code>Target</code> объекта <code>WeakReference</code> к типу объекта. Если свойство <code>Target</code> возвращает <code>null</code>, объект был собран; иначе вы можете продолжать использовать объект, потому что приложение вновь получило сильную ссылку на него».</span> И про риск: «When you use a weak reference, the application can still obtain a strong reference to the object, which prevents it from being collected. However, <span class="hl">there is always the risk that the garbage collector will get to the object first before a strong reference is reestablished</span>». <span class="ru-tr">«Когда вы используете слабую ссылку, приложение всё ещё может получить сильную ссылку на объект, что предотвращает его сбор. Однако всегда есть риск, что сборщик мусора доберётся до объекта первым, прежде чем сильная ссылка будет восстановлена».</span> Практика: всегда работай с <b>полученной из <code>Target</code> ссылкой</b> (не с <code>IsAlive</code> — между её проверкой и использованием объект мог быть собран); ветка <code>null</code> — пересоздать объект.',
      sources: ["ms-weak"],
    },
    {
      id: "s3", num: "03", kicker: "Short weak reference", title: "Short: Target → null при сборе (parameterless ctor)",
      viewBox: "0 0 340 210", zones: SHORT_ZONES,
      code: ["var wr = new WeakReference(obj);   // SHORT — parameterless-ish ctor (без 2-го арг)", "// объект собран сборщиком → wr.Target становится null", "// сама WeakReference — тоже managed-объект, подлежит сбору"],
      scenes: [
        { codeLine: 0, caption: '<b>Short</b> weak reference — конструктор <span class="hl">без второго аргумента</span>: <code>new WeakReference(obj)</code>.', nodes: [{ id: "s", kind: "gate", at: { zone: "short", row: 0 }, state: "ok", label: "new WeakReference(obj)", detail: "short", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Когда объект собран, <code>Target</code> <span class="hl">становится <code>null</code></span> — так приложение узнаёт, что объекта больше нет.', nodes: [{ id: "s", kind: "gate", at: { zone: "short", row: 0 }, state: "ok", label: "short", detail: "до сбора жив" }, { id: "n", kind: "gate", at: { zone: "short", row: 1 }, state: "fail", label: "после сбора", detail: "Target == null", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Сама <code>WeakReference</code> — <span class="hl">тоже managed-объект</span> и подлежит сбору, как любой другой.', nodes: [{ id: "s", kind: "gate", at: { zone: "short", row: 0 }, state: "ok", label: "WeakReference", detail: "managed-объект" }, { id: "g", kind: "gate", at: { zone: "short", row: 1 }, state: "ok", label: "subject to GC", detail: "как любой", accent: true }], edges: [] },
      ],
      explain: 'Short weak reference (verbatim): «The target of a short weak reference <span class="hl">becomes <code>null</code> when the object is reclaimed by garbage collection</span>. The weak reference is itself a managed object, and is subject to garbage collection just like any other managed object. <span class="hl">A short weak reference is the parameterless constructor for <code>WeakReference</code></span>». <span class="ru-tr">«Цель короткой слабой ссылки становится <code>null</code>, когда объект освобождается сборкой мусора. Сама слабая ссылка является управляемым объектом и подлежит сборке мусора, как любой другой управляемый объект. Короткая слабая ссылка — это конструктор без параметров для <code>WeakReference</code>».</span> То есть <code>new WeakReference(obj)</code> (без второго булева-аргумента) — «short» <span class="ru-tr">«короткая»</span>: как только объект собран, <code>Target</code> обнуляется, и это твой сигнал «объект пропал». Это дефолтный и самый частый вид. Если у типа нет <code>Finalize</code>, «short weak reference functionality applies» <span class="ru-tr">«применяется поведение короткой слабой ссылки»</span> независимо от того, как создавали. Long — для отслеживания сквозь финализацию (разбор 04).',
      sources: ["ms-weak"],
    },
    {
      id: "s4", num: "04", kicker: "Long + guidelines", title: "Long: хранится после Finalize (ctor true); правила",
      viewBox: "0 0 340 210", zones: LONG_ZONES,
      code: ["var wr = new WeakReference(obj, true);  // LONG — второй аргумент true", "// хранится ПОСЛЕ вызова Finalize → можно отследить resurrection", "// состояние объекта после финализации НЕПРЕДСКАЗУЕМО", "// guidelines: long — только по необходимости; не мелким; не вместо кэша"],
      scenes: [
        { codeLine: 0, caption: '<b>Long</b> weak reference — <span class="hl">второй аргумент <code>true</code></span>: <code>new WeakReference(obj, true)</code>.', nodes: [{ id: "l", kind: "gate", at: { zone: "long", row: 0 }, state: "ok", label: "WeakReference(obj, true)", detail: "long", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Хранится <span class="hl">после вызова <code>Finalize</code></span> → позволяет отследить resurrection, но <b>состояние объекта непредсказуемо</b>.', nodes: [{ id: "l", kind: "gate", at: { zone: "long", row: 0 }, state: "ok", label: "long", detail: "после Finalize" }, { id: "u", kind: "gate", at: { zone: "long", row: 1 }, state: "fail", label: "state", detail: "unpredictable", accent: true }], edges: [] },
        { codeLine: 3, caption: 'Guidelines: long — <span class="hl">только по необходимости</span>; не для мелких объектов (указатель может быть больше); <b>не вместо управления памятью</b> — заведи кэш.', nodes: [{ id: "l", kind: "gate", at: { zone: "long", row: 0 }, state: "ok", label: "long", detail: "по необходимости" }, { id: "g", kind: "gate", at: { zone: "guide", row: 0 }, state: "fail", label: "не мелким · не вместо кэша", detail: "правила", accent: true }], edges: [] },
      ],
      explain: 'Long weak reference (verbatim): «A long weak reference is <span class="hl">retained after the object\'s <code>Finalize</code> method has been called</span>. This allows the object to be recreated, but the <b>state of the object remains unpredictable</b>. To use a long reference, specify <code>true</code> in the <code>WeakReference</code> constructor». <span class="ru-tr">«Длинная слабая ссылка сохраняется после того, как был вызван метод <code>Finalize</code> объекта. Это позволяет пересоздать объект, но <b>состояние объекта остаётся непредсказуемым</b>. Чтобы использовать длинную ссылку, укажите <code>true</code> в конструкторе <code>WeakReference</code>».</span> То есть long живёт дольше short — сквозь финализацию, позволяя поймать resurrection; но объект после <code>Finalize</code> в неопределённом состоянии (анти-миф MM18: она НЕ держит объект живым, лишь отслеживает). Guidelines (verbatim): «Use long weak references <span class="hl">only when necessary</span> as the state of the object is unpredictable after finalization» <span class="ru-tr">«Используйте длинные слабые ссылки только при необходимости, так как состояние объекта после финализации непредсказуемо»</span>; «Avoid using weak references to small objects because the pointer itself may be as large or larger» <span class="ru-tr">«Избегайте использования слабых ссылок на маленькие объекты, потому что сам указатель может быть таким же большим или больше»</span>; «Avoid using weak references as an automatic solution to memory management problems. Instead, develop an effective caching policy» <span class="ru-tr">«Избегайте использования слабых ссылок как автоматического решения проблем управления памятью. Вместо этого разработайте эффективную политику кэширования»</span>.',
      sources: ["ms-weak"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный замер", title: "Weak разрешает сбор; short vs long — на числах",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["// weak ref: после GC объект собран → Target null (afterGC=False)", "// strong ref (из Target) удерживает объект (strongRefKeepsAlive=True)", "new WeakReference(o).TrackResurrection        // False — short", "new WeakReference(o, true).TrackResurrection   // True  — long"],
      predictAt: 2, predictQ: 'Weak-ссылка на объект. После полного GC (без strong-ссылки) <code>Target</code> — что покажет: жив или собран?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Левый замер: только weak-ссылка → после GC объект <span class="hl">собран</span>: <code>beforeGC=True afterGC=False</code>. Weak не помешала сбору.', nodes: [{ id: "a", kind: "gate", at: { zone: "allows", row: 0 }, state: "ok", label: "weak → сбор", detail: "afterGC=False", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Правый замер: <code>short</code> (parameterless) → <code>TrackResurrection=False</code>; <code>long</code> (true) → <code>True</code>.', nodes: [{ id: "a", kind: "gate", at: { zone: "allows", row: 0 }, state: "ok", label: "weak allows", detail: "afterGC=False" }, { id: "k", kind: "gate", at: { zone: "kind", row: 0 }, state: "ok", label: "short/long", detail: "False / True", accent: true }], edges: [] },
        { codeLine: 3, out: "afterGC=False · short=False long=True", caption: 'Панель: <b>weak afterGC=False</b> (сбор разрешён, 5/5), а strong из <code>Target</code> удерживает (<b>strongRefKeepsAlive=True</b>); <b>short=False long=True</b> (<code>TrackResurrection</code>, 3/3).', nodes: [{ id: "a", kind: "gate", at: { zone: "allows", row: 0 }, state: "ok", label: "afterGC", detail: "False" }, { id: "k", kind: "gate", at: { zone: "kind", row: 0 }, state: "ok", label: "short=False long=True", detail: "TrackResurrection", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — поведение weak-ссылок, снятое в рантайме. (1) <b>Weak разрешает сбор</b>: держим объект только через weak (проверка через <code>Target</code>-каст в helper-методе, чтобы не оставить strong-ссылку на стеке) → после полного GC <code>Target == null</code>: <code>beforeGC=True afterGC=False</code> (5/5), ровно как «permits the garbage collector to collect» <span class="ru-tr">«позволяет сборщику мусора собрать»</span>. (2) <b>Strong удерживает</b>: если из <code>Target</code> достать strong-ссылку и держать её — объект переживает GC: <code>strongRefKeepsAlive=True</code> (3/3), «obtain a strong reference… prevents it from being collected». <span class="ru-tr">«получить сильную ссылку… предотвращает его сбор».</span> (3) <b>Short vs long</b>: <code>new WeakReference(o).TrackResurrection</code> → <b>False</b> (short), <code>new WeakReference(o, true).TrackResurrection</code> → <b>True</b> (long). Числа реальны; главный факт — weak ≠ удержание, а разрешение сбора с сохранением доступа (анти-миф MM17/MM18).',
      sources: ["ms-weak"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>static WeakReference Make(){ return new WeakReference(new byte[500000]); } static bool StillThere(WeakReference wr){ return (wr.Target as byte[]) != null; } var wr = Make(); bool before = StillThere(wr); GC.Collect(); GC.WaitForPendingFinalizers(); GC.Collect(); bool after = StillThere(wr); Console.WriteLine($"beforeGC={before} afterGC={after}");</code> — что напечатает?',
      options: ["beforeGC=True afterGC=False", "beforeGC=True afterGC=True", "beforeGC=False afterGC=False", "beforeGC=False afterGC=True"], correctIndex: 0, xp: 10,
      okText: 'Weak reference «<span class="hl">permits the garbage collector to collect</span>» <span class="ru-tr">«позволяет сборщику мусора собрать»</span>: без strong-ссылки объект собран, <code>Target</code> → null. Печать: <b>beforeGC=True afterGC=False</b>. (Weak НЕ предотвращает сбор — миф наоборот.)',
      noText: 'Weak разрешает сбор → после GC <code>Target == null</code>. Реальный вывод: <b>beforeGC=True afterGC=False</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "beforeGC=True afterGC=False" }, sourceRefs: ["ms-weak"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var o = new object(); var wr = new WeakReference(o); object strong = wr.Target; o = null; GC.Collect(); GC.WaitForPendingFinalizers(); GC.Collect(); bool stillAlive = wr.Target != null; GC.KeepAlive(strong); Console.WriteLine($"strongRefKeepsAlive={stillAlive}");</code> — что напечатает?',
      options: ["strongRefKeepsAlive=True", "strongRefKeepsAlive=False", "(исключение)", "0"], correctIndex: 0, xp: 10,
      okText: 'Достали strong-ссылку из <code>Target</code> и держим (<code>KeepAlive</code>) → «obtain a strong reference… <span class="hl">prevents it from being collected</span>». <span class="ru-tr">«получить сильную ссылку… предотвращает его сбор».</span> Объект жив. Печать: <b>strongRefKeepsAlive=True</b>.',
      noText: 'Strong-ссылка предотвращает сбор, даже если исходную переменную обнулили. Реальный вывод: <b>strongRefKeepsAlive=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "strongRefKeepsAlive=True" }, sourceRefs: ["ms-weak"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>var wShort = new WeakReference(new object()); var wLong = new WeakReference(new object(), true); Console.WriteLine($"shortTracksResurrection={wShort.TrackResurrection} longTracksResurrection={wLong.TrackResurrection}");</code> — что напечатает?',
      options: ["shortTracksResurrection=False longTracksResurrection=True", "shortTracksResurrection=True longTracksResurrection=False", "shortTracksResurrection=True longTracksResurrection=True", "shortTracksResurrection=False longTracksResurrection=False"], correctIndex: 0, xp: 10,
      okText: '<b>Short</b> (parameterless-ish ctor) → <code>TrackResurrection=False</code>; <b>long</b> (второй арг <code>true</code>) → <code>True</code> — «retained after… <code>Finalize</code>… called» <span class="ru-tr">«сохраняется после… вызова <code>Finalize</code>…»</span>. Печать: <b>shortTracksResurrection=False longTracksResurrection=True</b>.',
      noText: 'Long (true) отслеживает сквозь финализацию (resurrection); short — нет. Реальный вывод: <b>shortTracksResurrection=False longTracksResurrection=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "shortTracksResurrection=False longTracksResurrection=True" }, sourceRefs: ["ms-weak"],
    },
  ],

  takeaways: [
    { icon: "why", k: "weak разрешает сбор", v: '«A weak reference <span class="hl">permits the garbage collector to collect the object</span> while still allowing… access» <span class="ru-tr">«Слабая ссылка позволяет сборщику мусора собрать объект, при этом по-прежнему давая… доступ»</span> — в отличие от strong, weak НЕ мешает сбору (замер: afterGC=False). Для тяжёлых, но пересоздаваемых объектов.' },
    { icon: "cost", k: "Target + гонка", v: 'Вернуть strong: <code>wr.Target as T</code>; <code>null</code> ⇒ собран, иначе — снова strong (замер: strongRefKeepsAlive=True). Есть <span class="hl">гонка</span>: GC мог успеть первым. Работай с полученной ссылкой, не с <code>IsAlive</code>.' },
    { icon: "avoid", k: "short vs long", v: '<b>short</b> (parameterless): <code>Target→null</code> при сборе (<code>TrackResurrection=False</code>). <b>long</b> (<code>true</code>): «retained after… <code>Finalize</code>» <span class="ru-tr">«сохраняется после… вызова <code>Finalize</code>»</span>, state «unpredictable» <span class="ru-tr">«непредсказуемо»</span> (<code>True</code>). Guidelines: long по необходимости, не мелким, <span class="hl">не вместо кэша</span>.' },
  ],

  foot: 'урок · <b>weak references</b> · 5 анимир. разборов · панель реального замера (weak→сбор, short/long) · дизайн <b>mid</b>',
};
