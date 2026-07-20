/**
 * Lesson: stackalloc and ref struct — stack allocation, restrictions (CS.S7.stackalloc-refstruct) —
 * expert density, 5 animated deep-dives. A stackalloc expression allocates a block of memory on the
 * stack — automatically discarded when the method returns, not subject to GC, and doesn\'t need to be
 * pinned by fixed. You can assign its result to a Span<T>/ReadOnlySpan<T> WITHOUT unsafe (unsafe is
 * only needed for a pointer type). Stack space is limited: a too-large allocation throws
 * StackOverflowException, so limit the size (conditional stackalloc vs new[]) and don\'t stackalloc in
 * loops. The content is UNDEFINED (unlike new, which zeroes), and T must be an unmanaged type;
 * stackalloc turns on CLR buffer-overrun detection. A ref struct can implement the disposable pattern
 * (and, from C# 13, IDisposable) and work with using.
 *
 * SIGNATURE machine panel (s5): REAL measurements — the recommended safe pattern
 * (n<=1024 ? stackalloc : new[]) keeps a small buffer on the stack (0 heap bytes) but puts a large one
 * on the heap (smallOnStack=True largeOnHeap=True); a stackalloc<->Span assignment needs no unsafe and
 * allocates 0 managed-heap bytes; a ref struct implements IDisposable and disposes via using.
 * evidence/F14/stackalloc-refstruct-exec.txt.
 *
 * Accuracy contract (G7) — verified against operators/stackalloc + ref-struct (fetch 2026-07-19) +
 * GT-M5-s7.md (SM F15..F20, F24, MM20). VOLATILE: the 1024 threshold is illustrative (MaxStackLimit),
 * NOT a hard guarantee — stated as environment-dependent. Version caveat: the stackalloc->pointer
 * outside unsafe is a C# 15 preview; ref struct IDisposable is C# 13.
 *   - every English quote is VERBATIM from the sources[] page it cites;
 *   - every card\'s verify.expect is the REAL stdout of run-csharp (evidence/F14/stackalloc-refstruct-exec.txt:
 *     "stackallocNoHeapAlloc=True lastElem=99"; "smallOnStack=True largeOnHeap=True"; "refStructDisposed=True");
 *   - NO GT-M5 myths: MM20 (stackalloc is safe without limits / its result always needs unsafe) — no,
 *     it\'s bounded by the stack (StackOverflowException), and for a Span unsafe is NOT needed; the
 *     memory is uninitialized.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S7.stackalloc-refstruct/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: stackalloc = stack block.
const Z_STACK: Zone = { id: "stack", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "stackalloc · блок НА СТЕКЕ", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "отбрасывается при return · не GC · не нужен fixed", subCls: "vz-zsub good", subY: 47 };
const STACK_ZONES: Zone[] = [Z_STACK];

// s2: → Span without unsafe.
const Z_SPAN: Zone = { id: "span", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "→ Span<T>", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "БЕЗ unsafe · 0 байт кучи", subCls: "vz-zsub good", subY: 47 };
const Z_PTR: Zone = { id: "ptr", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "→ указатель", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "нужен unsafe", subCls: "vz-zsub heap", subY: 47 };
const SPAN_ZONES: Zone[] = [Z_SPAN, Z_PTR];

// s3: stack limited → StackOverflow.
const Z_LIMIT: Zone = { id: "limit", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "стек ограничен", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "слишком много → StackOverflowException", subCls: "vz-zsub heap", subY: 47 };
const Z_RULES: Zone = { id: "rules", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "правила", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "лимит размера · не в циклах", subCls: "vz-zsub good", subY: 47 };
const LIMIT_ZONES: Zone[] = [Z_LIMIT, Z_RULES];

// s4: undefined content + unmanaged + ref struct disposable.
const Z_UNDEF: Zone = { id: "undef", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "содержимое undefined", labelCls: "vz-zlabel heap sm", lx: 89, ly: 24, sub: "не 0 (в отличие от new) · T unmanaged", subCls: "vz-zsub heap", subY: 47 };
const Z_DISP: Zone = { id: "disp", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ref struct disposable", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "using · IDisposable с C# 13", subCls: "vz-zsub good", subY: 47 };
const UNDEF_ZONES: Zone[] = [Z_UNDEF, Z_DISP];

// s5 (SIGNATURE): real measurement.
const Z_COND: Zone = { id: "cond", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "условный stackalloc", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "малое=стек · большое=heap", subCls: "vz-zsub good", subY: 47 };
const Z_NOUN: Zone = { id: "noun", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Span без unsafe", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "0 байт кучи · disposed OK", subCls: "vz-zsub good", subY: 47 };
const SIG_ZONES: Zone[] = [Z_COND, Z_NOUN];

export const stackallocRefstruct: LessonData = {
  id: "CS.S7.stackalloc-refstruct",
  track: "CS",
  section: "CS.S7",
  module: "S7.10",
  lang: "csharp",
  title: "stackalloc и ref struct: стек, ограничения",
  kicker: "C# вглубь · S7 · аллокация на стеке",
  home: { subtitle: "stackalloc на стеке, Span без unsafe, лимиты, ref struct", icon: "gc", estMinutes: 10 },
  prereqs: ["CS.S7.span-memory"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-stackalloc", kind: "doc", org: "Microsoft Learn", title: "stackalloc expression (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/stackalloc", date: "2026-06-16" },
    { id: "ms-refstruct", kind: "doc", org: "Microsoft Learn", title: "ref struct types (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/ref-struct", date: "2026-01-14" },
  ],

  spec: [
    { text: "«A stackalloc expression allocates a block of memory on the stack. A stack-allocated memory block created during the method execution is automatically discarded when that method returns.»", source: "ms-stackalloc" },
  ],
  edgeCases: [
    { text: "Не GC, не fixed (verbatim): «You can\'t explicitly free the memory allocated by <code>stackalloc</code>. A stack-allocated memory block <span class=\"hl\">isn\'t subject to garbage collection and doesn\'t need to be pinned by a <code>fixed</code> statement</span>».", source: "ms-stackalloc" },
    { text: "Стек ограничен (verbatim): «The amount of memory available on the stack is limited. If you allocate too much memory on the stack, a <span class=\"hl\">StackOverflowException is thrown</span>». Правила: лимит размера (условный <code>stackalloc</code> vs <code>new[]</code>) и «<b>Avoid using stackalloc inside loops</b>».", source: "ms-stackalloc" },
    { text: "Содержимое не инициализировано (verbatim): «The content of the newly allocated memory is <span class=\"hl\">undefined</span>… <b>Not initializing memory allocated by stackalloc is an important difference from the <code>new</code> operator</b>. Memory allocated by using the <code>new</code> operator is initialized to the 0 bit pattern». <code>T</code> должен быть unmanaged-типом.", source: "ms-stackalloc" },
  ],

  misconceptions: [
    {
      wrong: "stackalloc безопасен без ограничений; результат stackalloc всегда требует unsafe; память обнулена как у new",
      hook: 'Три мифа про stackalloc. «<span class="wrong">безопасен без ограничений</span>» — нет: «<span class="hl">The amount of memory available on the stack is limited</span>… a <code>StackOverflowException</code> is thrown» → лимит размера, не в циклах. «<span class="wrong">результат всегда требует unsafe</span>» — нет: «<span class="hl">You don\'t need to use an <code>unsafe</code> context</span> when you assign a stack-allocated memory block to a <code>Span&lt;T&gt;</code>»; unsafe нужен только для указателя. «<span class="wrong">память обнулена</span>» — нет: «The content… is <span class="hl">undefined</span>», в отличие от <code>new</code>. Ниже <b>пять разборов</b>: stackalloc на стеке, → Span без unsafe, лимит стека + правила, undefined + unmanaged + ref struct disposable, и <b>машинная панель</b> — реальный замер.',
      source: "ms-stackalloc",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "stackalloc = стек", title: "Блок на стеке, отбрасывается при return, не GC",
      viewBox: "0 0 340 210", zones: STACK_ZONES,
      code: ["Span<int> s = stackalloc int[100];  // блок на СТЕКЕ метода", "// отбрасывается автоматически, когда метод возвращается", "// не подлежит GC · освободить явно нельзя · fixed не нужен"],
      scenes: [
        { codeLine: 0, caption: '<code>stackalloc</code> выделяет блок памяти <span class="hl">на стеке</span> текущего метода (не на managed heap).', nodes: [{ id: "s", kind: "gate", at: { zone: "stack", row: 0 }, state: "ok", label: "stackalloc int[100]", detail: "на стеке", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Блок <span class="hl">автоматически отбрасывается</span>, когда метод возвращается. Освободить его явно <b>нельзя</b>.', nodes: [{ id: "s", kind: "gate", at: { zone: "stack", row: 0 }, state: "ok", label: "блок", detail: "на стеке" }, { id: "d", kind: "gate", at: { zone: "stack", row: 1 }, state: "ok", label: "при return", detail: "отбрасывается сам", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Не подлежит <span class="hl">сборке мусора</span> и не требует пиннинга через <code>fixed</code> (он и так не двигается).', nodes: [{ id: "s", kind: "gate", at: { zone: "stack", row: 0 }, state: "ok", label: "не GC", detail: "стек" }, { id: "f", kind: "gate", at: { zone: "stack", row: 1 }, state: "ok", label: "fixed не нужен", detail: "не двигается", accent: true }], edges: [] },
      ],
      explain: 'Что такое stackalloc (verbatim): «A <code>stackalloc</code> expression <span class="hl">allocates a block of memory on the stack</span>. A stack-allocated memory block created during the method execution <span class="hl">is automatically discarded when that method returns</span>. You can\'t explicitly free the memory allocated by <code>stackalloc</code>. A stack-allocated memory block <b>isn\'t subject to garbage collection and doesn\'t need to be pinned by a <code>fixed</code> statement</b>». То есть stackalloc — способ взять временный буфер <b>без давления на GC</b>: он живёт на стеке кадра метода, исчезает при выходе, GC его не касается. Отсюда и ограничения (стек мал, содержимое не инициализировано — разборы 03–04), и связь со Span (разбор 02): Span поверх stackalloc — типобезопасный, allocation-free буфер.',
      sources: ["ms-stackalloc"],
    },
    {
      id: "s2", num: "02", kicker: "→ Span без unsafe", title: "stackalloc → Span<T> без unsafe; указатель — с unsafe",
      viewBox: "0 0 340 210", zones: SPAN_ZONES,
      code: ["Span<int> s = stackalloc int[100];  // БЕЗ unsafe — безопасно", "unsafe { int* p = stackalloc int[100]; }  // указатель → нужен unsafe", "// 0 байт кучи: буфер на стеке, Span — вью в него"],
      predictAt: 1, predictQ: 'Присвоить результат <code>stackalloc int[100]</code> переменной <code>Span&lt;int&gt;</code> — нужен ли <code>unsafe</code>?', console: true,
      scenes: [
        { codeLine: 0, caption: 'Результат <code>stackalloc</code> можно присвоить <code>Span&lt;T&gt;</code>/<code>ReadOnlySpan&lt;T&gt;</code> <span class="hl">БЕЗ <code>unsafe</code></span> — компилятор гарантирует безопасность.', nodes: [{ id: "s", kind: "gate", at: { zone: "span", row: 0 }, state: "ok", label: "→ Span", detail: "без unsafe", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>unsafe</code> нужен <span class="hl">только для указательного типа</span> (<code>int* p = stackalloc</code>).', nodes: [{ id: "s", kind: "gate", at: { zone: "span", row: 0 }, state: "ok", label: "Span", detail: "safe" }, { id: "p", kind: "gate", at: { zone: "ptr", row: 0 }, state: "fail", label: "int*", detail: "нужен unsafe", accent: true }], edges: [] },
        { codeLine: 2, out: "stackallocNoHeapAlloc=True lastElem=99", caption: 'Замер: буфер на стеке → <span class="hl">0 байт managed heap</span> (Span — вью в него). Печать: <b>stackallocNoHeapAlloc=True lastElem=99</b>.', nodes: [{ id: "s", kind: "gate", at: { zone: "span", row: 0 }, state: "ok", label: "Span", detail: "0 байт кучи" }, { id: "z", kind: "gate", at: { zone: "ptr", row: 0 }, state: "ok", label: "замер", detail: "stack, не heap", accent: true }], edges: [] },
      ],
      explain: 'stackalloc и Span (verbatim): «You can assign the result of a <code>stackalloc</code> expression to a variable of one of the following types: <code>System.Span&lt;T&gt;</code> or <code>System.ReadOnlySpan&lt;T&gt;</code>… <span class="hl">You don\'t need to use an <code>unsafe</code> context when you assign a stack-allocated memory block to a <code>Span&lt;T&gt;</code> or <code>ReadOnlySpan&lt;T&gt;</code> variable</span>». А для указателя: «You must use an <code>unsafe</code> context when you work with pointer types» (<code>int* p = stackalloc int[…]</code>). Рекомендация доки прямо: «Use <code>Span&lt;T&gt;</code> or <code>ReadOnlySpan&lt;T&gt;</code> types to work with stack-allocated memory whenever possible». Замер: <code>Span&lt;int&gt; s = stackalloc int[100]</code> добавляет <b>0</b> байт managed heap — буфер на стеке, Span лишь вью. Это идеальная связка: временный буфер без аллокации кучи и без <code>unsafe</code>. (Оговорка: конвертация <code>stackalloc</code>→указатель <b>вне</b> <code>unsafe</code> — preview-фича C# 15.)',
      sources: ["ms-stackalloc"],
    },
    {
      id: "s3", num: "03", kicker: "Стек ограничен", title: "Слишком много → StackOverflowException; лимит, не в циклах",
      viewBox: "0 0 340 210", zones: LIMIT_ZONES,
      code: ["Span<byte> b = n <= 1024 ? stackalloc byte[n] : new byte[n];  // условный лимит", "// стек ограничен → слишком большой stackalloc = StackOverflowException", "// НЕ в циклах: выдели блок ВНЕ цикла и переиспользуй внутри"],
      scenes: [
        { codeLine: 1, caption: 'Памяти на стеке <span class="hl">мало</span>: слишком большой <code>stackalloc</code> → <b>StackOverflowException</b> (её не поймать).', nodes: [{ id: "l", kind: "gate", at: { zone: "limit", row: 0 }, state: "fail", label: "слишком много", detail: "StackOverflow", accent: true }], edges: [] },
        { codeLine: 0, caption: 'Правило 1: <span class="hl">лимитируй размер</span> — маленькое на стек, большое на <code>new[]</code> (условный <code>stackalloc</code>). Порог (напр. 1024) — <i>иллюстрация</i>, зависит от окружения.', nodes: [{ id: "l", kind: "gate", at: { zone: "limit", row: 0 }, state: "fail", label: "лимит", detail: "StackOverflow" }, { id: "r", kind: "gate", at: { zone: "rules", row: 0 }, state: "ok", label: "n<=1024 ? stackalloc : new[]", detail: "условно", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Правило 2: <span class="hl">НЕ в циклах</span> — «Allocate the memory block outside a loop and reuse it inside the loop».', nodes: [{ id: "r", kind: "gate", at: { zone: "limit", row: 0 }, state: "ok", label: "условный лимит", detail: "OK" }, { id: "n", kind: "gate", at: { zone: "rules", row: 0 }, state: "fail", label: "stackalloc в цикле", detail: "нельзя", accent: true }], edges: [] },
      ],
      explain: 'Ограничение стека (verbatim, анти-миф MM20): «<span class="hl">The amount of memory available on the stack is limited. If you allocate too much memory on the stack, a <code>StackOverflowException</code> is thrown</span>. To avoid that exception, follow these rules: Limit the amount of memory you allocate by using <code>stackalloc</code>… <span class="hl">Avoid using <code>stackalloc</code> inside loops</span>. Allocate the memory block outside a loop and reuse it inside the loop». Каноничный безопасный паттерн — <b>условный</b> stackalloc: <code>Span&lt;byte&gt; buffer = inputLength &lt;= MaxStackLimit ? stackalloc byte[inputLength] : new byte[inputLength]</code>. Важно (VOLATILE): порог <code>1024</code>/<code>MaxStackLimit</code> — <b>иллюстрация</b>, не гарантия: «the amount of memory available on the stack depends on the environment… be conservative when you define the actual limit value». Замером в панели увидим оба пути: малое — на стеке (0 байт кучи), большое — на <code>new[]</code> (heap).',
      sources: ["ms-stackalloc"],
    },
    {
      id: "s4", num: "04", kicker: "undefined + ref struct", title: "Содержимое не 0; T unmanaged; ref struct disposable (C# 13)",
      viewBox: "0 0 340 210", zones: UNDEF_ZONES,
      code: ["Span<int> s = stackalloc int[3];  // содержимое НЕ инициализировано (не 0, в отличие от new)", "stackalloc int[3] { 1, 2, 3 };    // T — только unmanaged-тип; инициализатор", "ref struct R : IDisposable { public void Dispose() {} }  // с C# 13 — можно; using работает"],
      scenes: [
        { codeLine: 0, caption: 'Содержимое <code>stackalloc</code> <span class="hl">undefined</span> — НЕ обнулено (в отличие от <code>new</code>, который даёт 0-паттерн). Инициализируй перед чтением.', nodes: [{ id: "u", kind: "gate", at: { zone: "undef", row: 0 }, state: "fail", label: "content undefined", detail: "не 0", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>T</code> в <code>stackalloc T[E]</code> — <span class="hl">только unmanaged-тип</span> (<code>string</code> → ошибка компиляции), <code>E</code> — неотрицательный int. Плюс CLR включает buffer-overrun detection.', nodes: [{ id: "u", kind: "gate", at: { zone: "undef", row: 0 }, state: "fail", label: "undefined" }, { id: "t", kind: "gate", at: { zone: "undef", row: 1 }, state: "ok", label: "T unmanaged", detail: "string → error", accent: true }], edges: [] },
        { codeLine: 2, caption: '<code>ref struct</code> может реализовать <span class="hl">disposable-паттерн</span> (работает с <code>using</code>); <b>с C# 13</b> — и <code>IDisposable</code> (замер: disposed).', nodes: [{ id: "t", kind: "gate", at: { zone: "undef", row: 0 }, state: "ok", label: "T unmanaged", detail: "ограничение" }, { id: "d", kind: "gate", at: { zone: "disp", row: 0 }, state: "ok", label: "ref struct : IDisposable", detail: "C# 13 · using", accent: true }], edges: [] },
      ],
      explain: 'Инициализация и тип (verbatim): «The content of the newly allocated memory is <span class="hl">undefined</span>. You should initialize it before it\'s used». И критично: «<b>Not initializing memory allocated by <code>stackalloc</code> is an important difference from the <code>new</code> operator</b>. Memory allocated by using the <code>new</code> operator is initialized to the 0 bit pattern». Тип: «In expression <code>stackalloc T[E]</code>, <code>T</code> must be an <span class="hl">unmanaged type</span> and <code>E</code> must evaluate to a non-negative <code>int</code> value» (замер: <code>stackalloc string[3]</code> — <code>CS0208</code>). Безопасность: «Using <code>stackalloc</code> automatically turns on <span class="hl">buffer overrun detection</span> features in the common language runtime (CLR)». А <code>ref struct</code> (verbatim, ref-struct): можно сделать disposable (паттерн <code>Dispose</code> + <code>using</code>), и «<span class="hl">Beginning with C# 13, you can also implement the <code>IDisposable</code></span> on <code>ref struct</code> types» (замер: <code>refStructDisposed=True</code>). Всё это — как безопасно пользоваться стековой памятью.',
      sources: ["ms-stackalloc", "ms-refstruct"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный замер", title: "Условный stackalloc: малое→стек, большое→heap; Span без unsafe; disposed",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["n<=1024 ? stackalloc byte[n] : new byte[n]  → small=0 байт, large>0", "Span<int> = stackalloc int[100]  → без unsafe, 0 байт кучи", "ref struct R : IDisposable + using  → refStructDisposed=True"],
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Замер 1: условный <code>stackalloc</code> — малый буфер <span class="hl">на стеке (0 байт кучи)</span>, большой — на <code>new[]</code> (heap): <code>smallOnStack=True largeOnHeap=True</code>.', nodes: [{ id: "c", kind: "gate", at: { zone: "cond", row: 0 }, state: "ok", label: "n<=1024?stack:heap", detail: "True/True", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Замер 2: <code>Span&lt;int&gt; s = stackalloc int[100]</code> — <span class="hl">без unsafe</span>, 0 байт managed heap (stackallocNoHeapAlloc=True).', nodes: [{ id: "c", kind: "gate", at: { zone: "cond", row: 0 }, state: "ok", label: "условный", detail: "small=стек" }, { id: "n", kind: "gate", at: { zone: "noun", row: 0 }, state: "ok", label: "Span без unsafe", detail: "0 байт кучи", accent: true }], edges: [] },
        { codeLine: 2, out: "smallOnStack=True largeOnHeap=True · refStructDisposed=True", caption: 'Замер 3: <code>ref struct : IDisposable</code> + <code>using</code> → <span class="hl">Dispose вызван</span> (C# 13). Панель: <b>smallOnStack=True largeOnHeap=True · refStructDisposed=True</b>.', nodes: [{ id: "c", kind: "gate", at: { zone: "cond", row: 0 }, state: "ok", label: "малое/большое", detail: "стек/heap" }, { id: "d", kind: "gate", at: { zone: "noun", row: 0 }, state: "ok", label: "ref struct disposed", detail: "True", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — три проверяемых факта про stackalloc/ref struct, снятые в рантайме и компиляторе. (1) <b>Условный лимит</b>: <code>n &lt;= 1024 ? stackalloc byte[n] : new byte[n]</code> — при n=100 добавляет <b>0</b> байт managed heap (на стеке), при n=100000 — аллоцирует на куче: <code>smallOnStack=True largeOnHeap=True</code> (3/3), ровно как в доке (иллюстративный порог, env-dependent). (2) <b>Span без unsafe</b>: <code>Span&lt;int&gt; s = stackalloc int[100]</code> компилируется без <code>unsafe</code> и даёт <b>0</b> байт кучи (<code>stackallocNoHeapAlloc=True</code>). (3) <b>ref struct disposable</b>: <code>ref struct R : IDisposable</code> с <code>using var r = new R()</code> — <code>Dispose</code> реально вызывается (<code>refStructDisposed=True</code>), подтверждая «Beginning with C# 13, you can also implement the <code>IDisposable</code> on <code>ref struct</code> types». Числа реальны; stackalloc — allocation-free стековый буфер под <code>Span</code>, безопасный при соблюдении лимитов.',
      sources: ["ms-stackalloc", "ms-refstruct"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>static (bool,int) StackAllocMeasure(){ long a0=GC.GetAllocatedBytesForCurrentThread(); Span&lt;int&gt; s=stackalloc int[100]; for(int i=0;i&lt;100;i++) s[i]=i; long a1=GC.GetAllocatedBytesForCurrentThread(); return ((a1-a0)==0, s[99]);} var(noHeapAlloc,last)=StackAllocMeasure(); Console.WriteLine($"stackallocNoHeapAlloc={noHeapAlloc} lastElem={last}");</code> — что напечатает (и нужен ли unsafe)?',
      options: ["stackallocNoHeapAlloc=True lastElem=99", "stackallocNoHeapAlloc=False lastElem=99", "(ошибка: нужен unsafe)", "stackallocNoHeapAlloc=True lastElem=0"], correctIndex: 0, xp: 10,
      okText: '<code>stackalloc int[100]</code> → <code>Span&lt;int&gt;</code> <span class="hl">без unsafe</span>, буфер на стеке → <b>0 байт кучи</b>. Печать: <b>stackallocNoHeapAlloc=True lastElem=99</b>. (Для Span unsafe НЕ нужен — миф.)',
      noText: '«You don\'t need to use an unsafe context… assign… to a Span<T>»; на стеке → 0 байт кучи. Реальный вывод: <b>stackallocNoHeapAlloc=True lastElem=99</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "stackallocNoHeapAlloc=True lastElem=99" }, sourceRefs: ["ms-stackalloc"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>static long Alloc(int n){ long a0=GC.GetAllocatedBytesForCurrentThread(); Span&lt;byte&gt; b = n&lt;=1024 ? stackalloc byte[n] : new byte[n]; b[0]=1; long a1=GC.GetAllocatedBytesForCurrentThread(); return a1-a0;} long smallBytes=Alloc(100); long largeBytes=Alloc(100000); Console.WriteLine($"smallOnStack={smallBytes==0} largeOnHeap={largeBytes&gt;0}");</code> — что напечатает?',
      options: ["smallOnStack=True largeOnHeap=True", "smallOnStack=False largeOnHeap=True", "smallOnStack=True largeOnHeap=False", "(StackOverflowException)"], correctIndex: 0, xp: 10,
      okText: 'Каноничный <span class="hl">условный <code>stackalloc</code></span>: <code>n&lt;=1024</code> → на стек (0 байт кучи), иначе → <code>new[]</code> (heap). Печать: <b>smallOnStack=True largeOnHeap=True</b>. Порог 1024 — иллюстрация, зависит от окружения.',
      noText: 'Условный stackalloc: малое на стек, большое на heap. Реальный вывод: <b>smallOnStack=True largeOnHeap=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "smallOnStack=True largeOnHeap=True" }, sourceRefs: ["ms-stackalloc"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>ref struct R : IDisposable { public static int disposed=0; public void Dispose()=&gt;disposed++; } static void Use(){ using var r=new R(); } Use(); Console.WriteLine($"refStructDisposed={R.disposed==1}");</code> — что напечатает?',
      options: ["refStructDisposed=True", "refStructDisposed=False", "(ошибка компиляции)", "0"], correctIndex: 0, xp: 10,
      okText: '<span class="hl">С C# 13</span> <code>ref struct</code> может реализовать <code>IDisposable</code> и работает с <code>using</code> → <code>Dispose</code> вызван один раз. Печать: <b>refStructDisposed=True</b>.',
      noText: '«Beginning with C# 13, you can also implement the IDisposable on ref struct types». Реальный вывод: <b>refStructDisposed=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "refStructDisposed=True" }, sourceRefs: ["ms-refstruct"],
    },
  ],

  takeaways: [
    { icon: "why", k: "stackalloc = стек", v: '«<span class="hl">allocates a block of memory on the stack</span>… automatically discarded when that method returns»; не GC, не нужен <code>fixed</code>. Результат → <code>Span&lt;T&gt;</code> <b>без unsafe</b> (замер: 0 байт кучи); unsafe — только для указателя.' },
    { icon: "cost", k: "стек ограничен", v: '«<span class="hl">a StackOverflowException is thrown</span>» на слишком большой блок. Правила: условный <code>n&lt;=лимит ? stackalloc : new[]</code> (замер: small=стек, large=heap), не в циклах. Порог (1024) — иллюстрация, env-dependent.' },
    { icon: "avoid", k: "undefined + ref struct", v: 'Содержимое <span class="hl">undefined</span> (не 0, в отличие от <code>new</code>); <code>T</code> — unmanaged; CLR включает buffer-overrun detection. <code>ref struct</code> может быть disposable (<code>using</code>; <code>IDisposable</code> — с C# 13, замер: disposed=True).' },
  ],

  foot: 'урок · <b>stackalloc и ref struct</b> · 5 анимир. разборов · панель реального замера (условный лимит, Span без unsafe, disposed) · дизайн <b>mid</b>',
};
