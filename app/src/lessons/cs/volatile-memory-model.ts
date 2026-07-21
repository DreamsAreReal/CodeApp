/**
 * Lesson: Volatile, the memory model, and reordering (CS.S8.volatile-memory-model) — expert density,
 * 5 animated deep-dives. On a multiprocessor system the compiler/processor may REORDER ordinary memory
 * operations; Volatile.Read/Write insert one-directional memory barriers that forbid specific
 * reorderings and force the value through memory (not a register/cache). A volatile write prevents
 * EARLIER ops from moving after it; a volatile read prevents LATER ops from moving before it — enough
 * to publish data behind a flag. But it is a special-case tool: normal locking is the default, and
 * one volatile op affects only a single access, so ALL access to the field must be volatile.
 *
 * SIGNATURE machine panel (s5): a volatile-published flag lets a reader thread safely observe the data
 * written before it — REAL run-csharp measurement (this file's exec cards): seen=99.
 *
 * Accuracy contract (G4/G7/G8):
 *   - every English quote is VERBATIM from the Volatile class API page, fetched 2026-07-21;
 *   - every card's verify.expect is the REAL, DETERMINISTIC stdout of run-csharp (all threads JOINED
 *     before print; the flag/loop patterns are reproducible): c1 "stopped=True sawStop=1" ·
 *     c2 "r=42" · c3 "seen=99".
 *
 * Loop: cards c1..c3 map to backend review items `CS.S8.volatile-memory-model/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: reordering under the memory model.
const Z_WROTE: Zone = { id: "wrote", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "ЧТО НАПИСАЛ", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "x=1; y=1;", subCls: "vz-zsub", subY: 47 };
const Z_RAN: Zone = { id: "ran", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "ЧТО ВЫПОЛНИЛОСЬ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "может быть переставлено", subCls: "vz-zsub heap", subY: 47 };
const REORDER_ZONES: Zone[] = [Z_WROTE, Z_RAN];

// s2: volatile write barrier.
const Z_VW: Zone = { id: "vw", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "Volatile.Write · барьер вниз", labelCls: "vz-zlabel good sm", lx: 170, ly: 22, sub: "ранние операции НЕ уедут ПОСЛЕ записи", subCls: "vz-zsub good", subY: 40 };
const VW_ZONES: Zone[] = [Z_VW];

// s3: volatile read barrier.
const Z_VR: Zone = { id: "vr", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "Volatile.Read · барьер вверх", labelCls: "vz-zlabel good sm", lx: 170, ly: 22, sub: "поздние операции НЕ уедут ДО чтения", subCls: "vz-zsub good", subY: 40 };
const VR_ZONES: Zone[] = [Z_VR];

// s4: when NOT to use — lock is the default; all access must be volatile.
const Z_LOCKDEF: Zone = { id: "lockdef", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ПО УМОЛЧАНИЮ", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "lock / Monitor", subCls: "vz-zsub good", subY: 47 };
const Z_SPECIAL: Zone = { id: "special", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "СПЕЦСЛУЧАЙ", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "volatile · ВСЕ доступы", subCls: "vz-zsub heap", subY: 47 };
const LOCKDEF_ZONES: Zone[] = [Z_LOCKDEF, Z_SPECIAL];

// s5 (SIGNATURE): publish-behind-a-flag.
const Z_WRITER: Zone = { id: "writer", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone", label: "WRITER", labelCls: "vz-zlabel sm", lx: 89, ly: 24, sub: "data=99; Volatile.Write(ready,1)", subCls: "vz-zsub", subY: 47 };
const Z_READER: Zone = { id: "reader", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "READER", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "ждёт ready → читает data", subCls: "vz-zsub good", subY: 47 };
const PUB_ZONES: Zone[] = [Z_WRITER, Z_READER];

export const volatileMemoryModel: LessonData = {
  id: "CS.S8.volatile-memory-model",
  track: "CS",
  section: "CS.S8",
  module: "S8.6",
  lang: "csharp",
  title: "Volatile, модель памяти, reordering",
  kicker: "C# вглубь · S8 · барьеры памяти",
  home: { subtitle: "reordering, Volatile.Read/Write, барьеры, публикация", icon: "async", estMinutes: 10 },
  prereqs: ["CS.S8.lock-statement"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-volatile", kind: "doc", org: "Microsoft Learn", title: "Volatile Class", url: "https://learn.microsoft.com/en-us/dotnet/api/system.threading.volatile", date: "2026-01-20" },
  ],

  spec: [
    { text: "Причина существования: «On a multiprocessor system, due to performance optimizations in the compiler or processor, regular memory operations may appear to be reordered when multiple processors are operating on the same memory».", source: "ms-volatile" },
    { text: "Направленность барьеров: «A volatile write operation prevents earlier memory operations on the thread from being reordered to occur after the volatile write. A volatile read operation prevents later memory operations on the thread from being reordered to occur before the volatile read».", source: "ms-volatile" },
  ],
  edgeCases: [
    { text: "Volatile форсирует память, не регистр: «Volatile reads and writes ensure that a value is read or written to memory and not cached (for example, in a processor register)».", source: "ms-volatile" },
    { text: "Одна операция — один доступ: «Calling one of these methods affects only a single memory access. To provide effective synchronization for a field, all access to the field must use Volatile.Read and Volatile.Write».", source: "ms-volatile" },
    { text: "Это спецслучай, а не дефолт: «Volatile memory operations are for special cases of synchronization, where normal locking is not an acceptable alternative».", source: "ms-volatile" },
  ],

  misconceptions: [
    {
      wrong: "volatile — это «атомарность» или «просто помечу поле и всё станет потокобезопасно»",
      hook: 'Нет: <code>volatile</code> — про <b>переупорядочивание</b>, не про атомарность. Причина: «On a multiprocessor system, due to performance optimizations in the compiler or processor, <span class="hl">regular memory operations may appear to be reordered</span> when multiple processors are operating on the same memory». <code>Volatile.Read/Write</code> ставят <b>однонаправленные</b> барьеры: «A <span class="hl">volatile write operation prevents earlier memory operations… from being reordered to occur after the volatile write</span>. A <span class="hl">volatile read operation prevents later memory operations… from being reordered to occur before the volatile read</span>». И это <b>не</b> замена локу: «Volatile memory operations are for <span class="hl">special cases</span> of synchronization, where normal locking is not an acceptable alternative»; плюс «all access to the field must use <code>Volatile.Read</code> and <code>Volatile.Write</code>». Дальше <b>пять разборов</b>: reordering, write-барьер, read-барьер, когда НЕ брать, и <b>машинная панель</b> — публикация данных за флагом реальным прогоном (seen=99).',
      source: "ms-volatile",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Reordering · модель памяти", title: "Компилятор/процессор могут переставить обычные обращения",
      viewBox: "0 0 340 210", zones: REORDER_ZONES,
      code: ["// Thread 1:            // Thread 2:", "x = 1;                int y2 = Volatile.Read(ref y);", "Volatile.Write(ref y, 1);  int x2 = x;", "// без барьеров порядок обращений НЕ гарантирован"],
      scenes: [
        { codeLine: 1, out: "", caption: 'Ты пишешь <code>x=1; y=1;</code> в этом порядке. Но на мультипроцессоре порядок в памяти <span class="hl">не гарантирован</span> без барьеров.', nodes: [{ id: "w", kind: "obj", at: { zone: "wrote", row: 0 }, typeTag: "код", value: "x=1; y=1;", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: '«<span class="hl">regular memory operations may appear to be reordered</span>» — компилятор или процессор ради скорости может переставить.', nodes: [{ id: "w", kind: "obj", at: { zone: "wrote", row: 0 }, typeTag: "код", value: "x=1; y=1;" }, { id: "r", kind: "obj", at: { zone: "ran", row: 0 }, typeTag: "факт", value: "порядок ≠ гарантирован", accent: true }], edges: [{ id: "e1", from: "w", to: "r", accent: true }] },
        { codeLine: 3, out: "", caption: 'Итог: другой поток может увидеть <code>y==1</code>, но <code>x==0</code> — если между обращениями нет барьеров. Их и ставит <code>Volatile</code> (разборы 02–03).', nodes: [{ id: "r", kind: "gate", at: { zone: "ran", row: 0 }, state: "fail", label: "y2==1, x2==0", detail: "видимо без барьеров", accent: true }], edges: [] },
      ],
      explain: 'Корень темы — <b>модель памяти</b>: гарантии порядка видимости обращений между потоками. «<span class="hl">On a multiprocessor system, due to performance optimizations in the compiler or processor, regular memory operations may appear to be reordered when multiple processors are operating on the same memory</span>. <span class="hl">Volatile memory operations prevent certain types of reordering with respect to the operation</span>». Барьеры не бесплатны: «<span class="hl">These operations might involve memory barriers on some processors, which can affect performance</span>». То есть без специальных операций «обычные» чтения/записи можно тасовать. Пример из доков: два потока и поля <code>x</code>, <code>y</code>, изначально 0; поток 1 делает <code>x=1; Volatile.Write(y,1)</code>, поток 2 — <code>y2=Volatile.Read(y); x2=x</code>. Волатильные операции гарантируют: «if thread 2 sees <code>y2 == 1</code>… <span class="hl">it must also see <code>x2 == 1</code></span>».',
      sources: ["ms-volatile"],
    },
    {
      id: "s2", num: "02", kicker: "Write-барьер · вниз", title: "Volatile.Write: ранние операции не уедут ПОСЛЕ записи",
      viewBox: "0 0 340 210", zones: VW_ZONES,
      code: ["data = 99;                 // ранняя запись", "Volatile.Write(ref ready, 1);  // барьер: data НЕ уедет ниже", "// значит: увидел ready==1 -> data уже записано"],
      scenes: [
        { codeLine: 0, out: "", caption: 'Сначала обычная запись <code>data = 99</code>. Она «ранняя» относительно волатильной записи ниже.', nodes: [{ id: "d", kind: "obj", at: { zone: "vw", row: 0 }, typeTag: "data", value: "= 99 (ранняя)", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>Volatile.Write(ready, 1)</code> — барьер: «prevents <span class="hl">earlier</span> memory operations… from being reordered to occur <span class="hl">after</span> the volatile write».', nodes: [{ id: "d", kind: "obj", at: { zone: "vw", row: 0 }, typeTag: "data", value: "= 99" }, { id: "v", kind: "gate", at: { zone: "vw", row: 1 }, state: "ok", label: "Volatile.Write(ready)", detail: "барьер ↓", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Следствие: <code>data=99</code> <span class="hl">гарантированно завершено</span> до того, как флаг стал 1. Флаг публикует данные.', nodes: [{ id: "v", kind: "gate", at: { zone: "vw", row: 0 }, state: "ok", label: "ready=1", detail: "после data" }, { id: "p", kind: "gate", at: { zone: "vw", row: 1 }, state: "ok", label: "publish", detail: "data готово", accent: true }], edges: [] },
      ],
      explain: 'Волатильная запись — барьер, «толкающий вниз»: «<span class="hl">A volatile write operation prevents earlier memory operations on the thread from being reordered to occur after the volatile write</span>». Из справки метода: «Writes the specified value to the specified field. On systems that require it, inserts a memory barrier that prevents the processor from reordering memory operations as follows: <span class="hl">If a read or write appears before this method in the code, the processor cannot move it after this method</span>». Практический смысл — <b>публикация</b>: сначала пишешь данные, потом волатильно ставишь флаг; кто увидел флаг — увидит и данные. На этом строятся lock-free-паттерны «ready-флага» (разбор 05, seen=99).',
      sources: ["ms-volatile"],
    },
    {
      id: "s3", num: "03", kicker: "Read-барьер · вверх", title: "Volatile.Read: поздние операции не уедут ДО чтения",
      viewBox: "0 0 340 210", zones: VR_ZONES,
      code: ["while (Volatile.Read(ref ready) == 0) { }  // барьер: чтение data НЕ поднимется выше", "int seen = data;                            // поздняя операция", "// увидел ready==1 -> следующее чтение data актуально"],
      scenes: [
        { codeLine: 0, out: "", caption: '<code>Volatile.Read(ready)</code> — барьер: «prevents <span class="hl">later</span> memory operations… from being reordered to occur <span class="hl">before</span> the volatile read».', nodes: [{ id: "v", kind: "gate", at: { zone: "vr", row: 0 }, state: "ok", label: "Volatile.Read(ready)", detail: "барьер ↑", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Чтение <code>data</code> — «поздняя» операция. Барьер не даёт ей <span class="hl">подняться выше</span> волатильного чтения флага.', nodes: [{ id: "v", kind: "gate", at: { zone: "vr", row: 0 }, state: "ok", label: "Volatile.Read", detail: "барьер ↑" }, { id: "d", kind: "obj", at: { zone: "vr", row: 1 }, typeTag: "data", value: "чтение (поздняя)", accent: true }], edges: [] },
        { codeLine: 2, out: "", caption: 'Пара write↓/read↑ даёт <b>happens-before</b>: увидел <code>ready==1</code> → следующее чтение <code>data</code> <span class="hl">актуально</span>.', nodes: [{ id: "hb", kind: "gate", at: { zone: "vr", row: 0 }, state: "ok", label: "read↑ + write↓", detail: "happens-before", accent: true }], edges: [] },
      ],
      explain: 'Волатильное чтение — зеркальный барьер, «тянущий вверх»: «<span class="hl">A volatile read operation prevents later memory operations on the thread from being reordered to occur before the volatile read</span>». Из справки: «Reads the value of the specified field. On systems that require it, inserts a memory barrier that prevents the processor from reordering memory operations as follows: <span class="hl">If a read or write appears after this method in the code, the processor cannot move it before this method</span>». Вместе с write-барьером это даёт корректную публикацию, НО с оговоркой из доков: волатильные операции — не «полный» happens-before на все случаи. В частности, волатильная запись флага не даёт мгновенной видимости: «<span class="hl">does not guarantee that a following volatile read of y on a different processor will see the updated value</span>» — то есть читающий поток может ещё какое-то время видеть старый флаг; гарантия срабатывает, лишь когда он <b>уже увидел</b> новое значение.',
      sources: ["ms-volatile"],
    },
    {
      id: "s4", num: "04", kicker: "Когда НЕ брать", title: "Дефолт — lock; volatile — спецслучай, и ВСЕ доступы",
      viewBox: "0 0 340 210", zones: LOCKDEF_ZONES,
      code: ["lock (gate) { ... }        // ДЕФОЛТ: проще и надёжнее", "Volatile.Write(ref f, 1);  // спецслучай, lock не подходит", "// ВСЕ доступы к f должны быть Volatile.Read/Write, иначе дыра"],
      predictAt: 2, predictQ: 'Почему <code>lock</code> — дефолт, а <code>Volatile</code> берут лишь как спецслучай, и почему нельзя смешивать волатильные и обычные доступы к одному полю?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'По умолчанию — <code>lock</code>/<code>Monitor</code>: «normal locking… provide the <span class="hl">easiest and least error-prone way</span> of synchronizing access to data».', nodes: [{ id: "l", kind: "gate", at: { zone: "lockdef", row: 0 }, state: "ok", label: "lock", detail: "дефолт · проще", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: '<code>Volatile</code> — «for <span class="hl">special cases</span> of synchronization, where normal locking is not an acceptable alternative» (напр. очень горячий флаг).', nodes: [{ id: "l", kind: "gate", at: { zone: "lockdef", row: 0 }, state: "ok", label: "lock", detail: "дефолт" }, { id: "s", kind: "gate", at: { zone: "special", row: 0 }, state: "", label: "Volatile", detail: "спецслучай", accent: true }], edges: [] },
        { codeLine: 2, out: "ВСЕ доступы к f — Volatile", caption: 'Ловушка: одна волатильная операция — «affects only a <span class="hl">single memory access</span>»; «all access to the field must use <code>Volatile.Read</code> and <code>Volatile.Write</code>».', nodes: [{ id: "s", kind: "gate", at: { zone: "special", row: 0 }, state: "fail", label: "смешал обычное + volatile", detail: "дыра в синхронизации", accent: true }], edges: [] },
      ],
      explain: 'Volatile — острый инструмент, не общий. «Volatile memory operations are for special cases of synchronization, where normal locking is not an acceptable alternative. <span class="hl">Under normal circumstances, the C# lock statement… and the Monitor class provide the easiest and least error-prone way of synchronizing access to data</span>, and the <code>Lazy&lt;T&gt;</code> class provides a simple way to write lazy initialization code without directly using double-checked locking». Две ловушки. Первая — область действия: «<span class="hl">Calling one of these methods affects only a single memory access. To provide effective synchronization for a field, all access to the field must use Volatile.Read and Volatile.Write</span>» — смешал обычный доступ с волатильным → синхронизации нет. Вторая — модификатор <code>volatile</code> в C# делает волатильным <b>каждое</b> обращение к полю, но «the <code>volatile</code> modifier cannot be applied to array elements. The <code>Volatile.Read</code> and <code>Volatile.Write</code> methods can be used on array elements» — для элементов массива нужны именно методы.',
      sources: ["ms-volatile"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · публикация", title: "Volatile-флаг публикует данные: reader видит seen=99",
      viewBox: "0 0 340 210", zones: PUB_ZONES,
      code: ["writer: data = 99; Volatile.Write(ref ready, 1);", "reader: while (Volatile.Read(ref ready)==0) {}  seen = data;", "// join обоих -> seen == ?"],
      predictAt: 2, predictQ: 'Writer пишет <code>data=99</code>, затем <code>Volatile.Write(ready,1)</code>. Reader крутится на <code>Volatile.Read(ready)</code>, потом читает <code>data</code>. Что за <code>seen</code>?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Writer: обычная запись <code>data=99</code>, затем волатильная <code>Volatile.Write(ready,1)</code> — <b>публикует</b> данные за флагом.', nodes: [{ id: "w", kind: "gate", at: { zone: "writer", row: 0 }, state: "ok", label: "data=99", detail: "затем ready=1", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Reader крутится на <code>Volatile.Read(ready)</code>; увидев 1, читает <code>data</code>. Барьеры дают: увидел флаг → видит и <code>data</code>.', nodes: [{ id: "w", kind: "gate", at: { zone: "writer", row: 0 }, state: "ok", label: "publish", detail: "ready=1" }, { id: "r", kind: "gate", at: { zone: "reader", row: 0 }, state: "ok", label: "ждёт ready", detail: "→ читает data", accent: true }], edges: [{ id: "e1", from: "w", to: "r", accent: true }] },
        { codeLine: 2, out: "seen=99", caption: 'Панель: <b>seen=99</b> (реальный прогон). Флаг + барьеры <span class="hl">безопасно публикуют</span> data — reader никогда не увидит недописанное: увидел флаг — увидит и данные под ним.', nodes: [{ id: "s", kind: "gate", at: { zone: "reader", row: 0 }, state: "ok", label: "seen", detail: "99", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — публикация данных за волатильным флагом, снятая реальным прогоном. Writer: <code>data = 99; Volatile.Write(ref ready, 1)</code>. Reader: <code>while (Volatile.Read(ref ready)==0){} seen = data</code>. Оба джойнятся, печать — <b>seen=99</b>. Это ровно гарантия из доков (сценарий x/y): write-барьер не даёт <code>data=99</code> «уехать» после установки флага, read-барьер не даёт чтению <code>data</code> «подняться» до чтения флага; поэтому «<span class="hl">if thread 2 sees y2 == 1</span>… <span class="hl">it must also see x2 == 1</span>». Заметь: волатильность гарантирует не «reader сразу увидит флаг», а «когда» увидит флаг — данные под ним будут актуальны. Это фундамент lock-free-публикации, но по умолчанию всё равно берут <code>lock</code> — он проще и не требует держать в голове барьеры на каждом доступе.',
      sources: ["ms-volatile"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>int stop = 0; var t = new Thread(() => { while (Volatile.Read(ref stop) == 0) { } }); t.Start(); Thread.Sleep(50); Volatile.Write(ref stop, 1); t.Join(); Console.WriteLine($"stopped={t.IsAlive == false} sawStop={Volatile.Read(ref stop)}");</code> — что напечатает?',
      options: ["stopped=True sawStop=1", "stopped=False sawStop=1", "stopped=True sawStop=0", "(зависает навсегда)"], correctIndex: 0, xp: 10,
      okText: '<code>Volatile.Read</code> в цикле гарантирует, что поток <span class="hl">увидит</span> волатильную запись флага и выйдет; после <code>Join</code> он мёртв. Итог <b>stopped=True sawStop=1</b>.',
      noText: 'Волатильные чтение/запись «ensure that a value is read or written to memory and not cached» — флаг виден, цикл завершится. Реальный вывод: <b>stopped=True sawStop=1</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "stopped=True sawStop=1" }, sourceRefs: ["ms-volatile"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>int x = 0; Volatile.Write(ref x, 42); int r = Volatile.Read(ref x); Console.WriteLine($"r={r}");</code> — что напечатает?',
      options: ["r=42", "r=0", "r (непредсказуемо)", "(исключение)"], correctIndex: 0, xp: 10,
      okText: '<code>Volatile.Write</code> кладёт 42 в память, <code>Volatile.Read</code> читает его же (в одном потоке — просто round-trip). Итог <b>r=42</b>.',
      noText: 'Volatile не меняет значение — только семантику барьеров/памяти. Реальный вывод: <b>r=42</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "r=42" }, sourceRefs: ["ms-volatile"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>int data = 0; int ready = 0; int seen = -1; var writer = new Thread(() => { data = 99; Volatile.Write(ref ready, 1); }); var reader = new Thread(() => { while (Volatile.Read(ref ready) == 0) {} seen = data; }); reader.Start(); writer.Start(); writer.Join(); reader.Join(); Console.WriteLine($"seen={seen}");</code> — что напечатает?',
      options: ["seen=99", "seen=0", "seen=-1", "seen (непредсказуемо)"], correctIndex: 0, xp: 10,
      okText: 'Write-барьер не даёт <code>data=99</code> уехать после <code>ready=1</code>; read-барьер не даёт чтению <code>data</code> подняться до чтения флага. Увидел <code>ready==1</code> → видит и данные: <b>seen=99</b>.',
      noText: 'Волатильная публикация за флагом: «if thread 2 sees y2 == 1… it must also see x2 == 1». Реальный вывод: <b>seen=99</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "seen=99" }, sourceRefs: ["ms-volatile"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Про reordering", v: 'Volatile — не атомарность, а порядок: «<span class="hl">regular memory operations may appear to be reordered</span>» на мультипроцессоре. Ещё форсирует память: «read or written to memory and not cached (for example, in a processor register)».' },
    { icon: "cost", k: "Два барьера", v: 'Write — «prevents <span class="hl">earlier</span>… from being reordered to occur <span class="hl">after</span>» (публикация); Read — «prevents <span class="hl">later</span>… from being reordered to occur <span class="hl">before</span>» (потребление). Пара даёт публикацию за флагом (seen=99).' },
    { icon: "avoid", k: "Спецслучай", v: '«Volatile memory operations are for <span class="hl">special cases</span>… where normal locking is not an acceptable alternative»; дефолт — <code>lock</code>. «all access to the field must use <code>Volatile.Read</code> and <code>Volatile.Write</code>» — смешивать нельзя.' },
  ],

  foot: 'урок · <b>Volatile и модель памяти</b> · 5 анимир. разборов · панель публикации за флагом · дизайн <b>mid</b>',
};
