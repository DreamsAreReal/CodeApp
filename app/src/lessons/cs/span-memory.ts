/**
 * Lesson: Span<T> / ReadOnlySpan<T> — a stack-only, allocation-free view (CS.S7.span-memory) —
 * expert density, 5 animated deep-dives. Span<T> is a type-safe view over a contiguous region of
 * memory — backed by a T[] array, a stackalloc buffer, or unmanaged memory. Creating one does NOT
 * copy the buffer or allocate on the managed heap (only references/offsets — the "view"). Span<T> is
 * a REF STRUCT, allocated on the stack and unable to escape to the heap, so a field of a class can\'t
 * be a Span<T> and a span can\'t be used in async operations. ReadOnlySpan<T> is the immutable version
 * and can be backed by a String. Memory<T> can live on the managed heap and be used in async — it has
 * none of Span<T>'s limitations (details in S7.9).
 *
 * SIGNATURE machine panel (s5): REAL allocation measurements — a Span slice allocates 0 bytes on the
 * managed heap while an array copy allocates (spanAllocates=False arrayCopyAllocates=True); a
 * ReadOnlySpan<char> over a String slices with 0 allocation; and a Span<T> field is a compile error
 * (CS8345). evidence/F14/span-memory-exec.txt.
 *
 * Accuracy contract (G7) — verified against memory-and-spans + ref-struct (fetch 2026-07-19) +
 * GT-M5-s7.md (SM F1..F6, F21..F23, MM19). Version caveat: some ref struct restrictions are relaxed
 * in C# 13 (async/iterators/interfaces/type-argument) — stated as "before C# 13" per SM F19/F22.
 *   - every English quote is VERBATIM from the sources[] page it cites;
 *   - every card\'s verify.expect is the REAL stdout of run-csharp (evidence/F14/span-memory-exec.txt:
 *     "spanAllocates=False arrayCopyAllocates=True"; "spanIsValueType=True spanIsRefStruct=True";
 *     "sliceLen=5 allocatedBytes=0");
 *   - NO GT-M5 myths: MM19 (Span == Memory / Span can be a class field / Span in async / Span
 *     allocates on the heap) — no, Span is a stack-only ref struct view with no heap allocation;
 *     Memory<T> is the heap/async-capable one.
 *
 * Loop: cards c1..c3 map to backend review items `CS.S7.span-memory/c{1..3}`.
 */
import type { Zone } from "../../engine/index.ts";
import type { LessonData } from "../types.ts";

// s1: Span = view over contiguous memory.
const Z_VIEW: Zone = { id: "view", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "Span<T> · ВЬЮ над непрерывной памятью", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "backed: T[] · stackalloc · unmanaged", subCls: "vz-zsub good", subY: 47 };
const VIEW_ZONES: Zone[] = [Z_VIEW];

// s2: no allocation.
const Z_SPAN: Zone = { id: "span", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Span slice", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "0 байт кучи · только ссылки/смещения", subCls: "vz-zsub good", subY: 47 };
const Z_COPY: Zone = { id: "copy", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone heap", label: "array copy", labelCls: "vz-zlabel heap sm", lx: 251, ly: 24, sub: "аллоцирует новый массив", subCls: "vz-zsub heap", subY: 47 };
const ALLOC_ZONES: Zone[] = [Z_SPAN, Z_COPY];

// s3: ref struct → stack-only restrictions.
const Z_REFSTRUCT: Zone = { id: "refstruct", x: 14, y: 34, w: 312, h: 168, cls: "vz-zone good", label: "Span<T> — ref struct · СТЕК-ТОЛЬКО", labelCls: "vz-zlabel good", lx: 170, ly: 24, sub: "не поле class · не в async · не boxing · не элемент массива", subCls: "vz-zsub good", subY: 47 };
const REFSTRUCT_ZONES: Zone[] = [Z_REFSTRUCT];

// s4: ReadOnlySpan + Memory.
const Z_RO: Zone = { id: "ro", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "ReadOnlySpan<T>", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "иммутабельна · backed String", subCls: "vz-zsub good", subY: 47 };
const Z_MEM: Zone = { id: "mem", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone", label: "Memory<T>", labelCls: "vz-zlabel sm", lx: 251, ly: 24, sub: "на куче · для async · нет ограничений Span", subCls: "vz-zsub", subY: 47 };
const RO_ZONES: Zone[] = [Z_RO, Z_MEM];

// s5 (SIGNATURE): real measurement.
const Z_NOALLOC: Zone = { id: "noalloc", x: 14, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "Span → 0 байт", labelCls: "vz-zlabel good sm", lx: 89, ly: 24, sub: "array copy → аллокация", subCls: "vz-zsub good", subY: 47 };
const Z_ISREF: Zone = { id: "isref", x: 176, y: 34, w: 150, h: 168, cls: "vz-zone good", label: "IsByRefLike", labelCls: "vz-zlabel good sm", lx: 251, ly: 24, sub: "ref struct · поле = CS8345", subCls: "vz-zsub good", subY: 47 };
const SIG_ZONES: Zone[] = [Z_NOALLOC, Z_ISREF];

export const spanMemory: LessonData = {
  id: "CS.S7.span-memory",
  track: "CS",
  section: "CS.S7",
  module: "S7.8",
  lang: "csharp",
  title: "Span<T>/ReadOnlySpan<T>: ref struct, без аллокаций",
  kicker: "C# вглубь · S7 · вью без аллокаций",
  home: { subtitle: "Span=вью без аллокации, ref struct, стек-только, Memory", icon: "gc", estMinutes: 10 },
  prereqs: ["CS.S7.gc-overview"],
  depth: 4,
  version: "1",
  status: "self-pass",

  sources: [
    { id: "ms-span", kind: "doc", org: "Microsoft Learn", title: "Memory-related and span types", url: "https://learn.microsoft.com/en-us/dotnet/standard/memory-and-spans/", date: "2024-07-12" },
    { id: "ms-refstruct", kind: "doc", org: "Microsoft Learn", title: "ref struct types (C# reference)", url: "https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/ref-struct", date: "2026-01-14" },
  ],

  spec: [
    { text: "«A Span<T> instance can be backed by an array of type T, a buffer allocated with stackalloc, or a pointer to unmanaged memory. Because it has to be allocated on the stack, it has a number of restrictions.»", source: "ms-span" },
  ],
  edgeCases: [
    { text: "Без копирования/аллокации (verbatim): «These types are designed to allow the creation of algorithms that <span class=\"hl\">avoid copying memory or allocating on the managed heap</span> more than necessary. Creating them … <b>does not involve duplicating the underlying buffers</b>: only the relevant references and offsets, which represent the \"view\" of the wrapped memory, are updated».", source: "ms-span" },
    { text: "Ограничения Span (verbatim): «<span class=\"hl\">a field in a class cannot be of type Span<T>, nor can span be used in asynchronous operations</span>». ReadOnlySpan<T> — «an immutable version… Instances can be also backed by a String».", source: "ms-span" },
    { text: "ref struct стек-только (verbatim, ref-struct): «You allocate instances of a <code>ref struct</code> type on the stack, and they <span class=\"hl\">can\'t escape to the managed heap</span>». Компилятор запрещает: элемент массива, поле class/non-ref struct, боксинг, захват в лямбде. <i>(Часть ограничений — async/итераторы/интерфейсы/тип-аргумент — ослаблена с C# 13.)</i>", source: "ms-refstruct" },
  ],

  misconceptions: [
    {
      wrong: "Span<T> = Memory<T>; Span можно положить в поле класса / использовать в async / боксить; Span аллоцирует на куче",
      hook: 'Пучок мифов про Span. «<span class="wrong">Span аллоцирует на куче</span>» — нет: создание «<span class="hl">does not involve duplicating the underlying buffers</span>», только ссылки/смещения (вью). «<span class="wrong">Span в поле класса / в async</span>» — нет: «<span class="hl">a field in a class cannot be of type Span<T></span>, nor can span be used in asynchronous operations» (это <b>ref struct</b>, стек-только). <span class="wrong">Span = Memory</span> — нет: <code>Memory<T></code> живёт на куче и годна для async («none of the limitations of Span<T>»). Ниже <b>пять разборов</b>: Span как вью, без аллокации (замер), ref struct/стек-только, ReadOnlySpan + Memory, и <b>машинная панель</b> — реальный замер 0 байт + IsByRefLike.',
      source: "ms-span",
    },
  ],

  segments: [
    {
      id: "s1", num: "01", kicker: "Span = вью", title: "Span<T> — вью над непрерывной памятью (не владелец)",
      viewBox: "0 0 340 210", zones: VIEW_ZONES,
      code: ["int[] arr = new int[1000];", "Span<int> s = arr.AsSpan(100, 500);  // окно в arr, БЕЗ копии", "// Span backed: T[] массив · stackalloc-буфер · unmanaged-указатель"],
      scenes: [
        { codeLine: 1, caption: '<code>Span&lt;T&gt;</code> — <span class="hl">вью (окно)</span> над непрерывным участком памяти. <code>arr.AsSpan(100,500)</code> смотрит В <code>arr</code>, не копируя.', nodes: [{ id: "v", kind: "gate", at: { zone: "view", row: 0 }, state: "ok", label: "AsSpan(100,500)", detail: "окно в arr", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Backed чем угодно непрерывным: <span class="hl">массив <code>T[]</code></span>, буфер <code>stackalloc</code>, или указатель на unmanaged-память.', nodes: [{ id: "v", kind: "gate", at: { zone: "view", row: 0 }, state: "ok", label: "Span", detail: "вью" }, { id: "b", kind: "gate", at: { zone: "view", row: 1 }, state: "ok", label: "backed", detail: "T[] · stackalloc · unmanaged", accent: true }], edges: [] },
        { codeLine: 0, caption: 'Смысл — <span class="hl">работать с куском без копий и аллокаций</span> кучи: в высокопроизводительном коде так избегают лишних строк/массивов.', nodes: [{ id: "v", kind: "gate", at: { zone: "view", row: 0 }, state: "ok", label: "вью", detail: "без копий" }, { id: "p", kind: "gate", at: { zone: "view", row: 1 }, state: "ok", label: "high-perf", detail: "меньше аллокаций", accent: true }], edges: [] },
      ],
      explain: 'Что такое span-типы (verbatim): «.NET includes a number of interrelated types that represent a contiguous, strongly typed region of arbitrary memory. These types are designed to allow the creation of algorithms that <span class="hl">avoid copying memory or allocating on the managed heap</span> more than necessary». Про <code>Span&lt;T&gt;</code>: «A <code>Span&lt;T&gt;</code> instance can be backed by an array of type <code>T</code>, a buffer allocated with <code>stackalloc</code>, or a pointer to unmanaged memory». Ключ: Span — не контейнер, а <b>вью</b>: он ссылается на чужой буфер и позволяет читать/писать его срез без владения и без копии. Отсюда его назначение — избегать аллокаций (замер в панели: срез Span — 0 байт кучи). Но за это платим ограничениями: Span — ref struct, стек-только (разбор 03).',
      sources: ["ms-span"],
    },
    {
      id: "s2", num: "02", kicker: "Без аллокации", title: "Срез Span не аллоцирует; копия массива — аллоцирует",
      viewBox: "0 0 340 210", zones: ALLOC_ZONES,
      code: ["Span<int> s = arr.AsSpan(100, 500);  // 0 байт кучи — только ссылка+смещение", "int[] copy = arr[100..600];          // аллоцирует НОВЫЙ массив (копия)", "// замер через GC.GetAllocatedBytesForCurrentThread()"],
      predictAt: 1, predictQ: 'Срез через <code>Span</code> (<code>AsSpan</code>) и копия массива (<code>arr[100..600]</code>) — что из них аллоцирует на куче?', console: true,
      scenes: [
        { codeLine: 0, out: "", caption: '<code>arr.AsSpan(100,500)</code> — <span class="hl">0 байт кучи</span>: обновляются только ссылка на <code>arr</code> и смещение/длина.', nodes: [{ id: "s", kind: "gate", at: { zone: "span", row: 0 }, state: "ok", label: "Span slice", detail: "0 байт", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>arr[100..600]</code> — это <span class="hl">копия в новый массив</span>: аллоцирует память под элементы среза.', nodes: [{ id: "s", kind: "gate", at: { zone: "span", row: 0 }, state: "ok", label: "Span", detail: "0 байт" }, { id: "c", kind: "gate", at: { zone: "copy", row: 0 }, state: "fail", label: "array copy", detail: "аллоцирует", accent: true }], edges: [] },
        { codeLine: 2, out: "spanAllocates=False arrayCopyAllocates=True", caption: 'Замер: <b>spanAllocates=False arrayCopyAllocates=True</b> (3/3). Span даёт тот же срез <span class="hl">бесплатно</span> по памяти — вот его ценность.', nodes: [{ id: "s", kind: "gate", at: { zone: "span", row: 0 }, state: "ok", label: "span", detail: "False" }, { id: "c", kind: "gate", at: { zone: "copy", row: 0 }, state: "fail", label: "copy", detail: "True", accent: true }], edges: [] },
      ],
      explain: 'Почему Span экономит память (verbatim): «Creating them (either via <code>Slice</code>, <code>AsSpan()</code>, a collection expression, or their constructors) <span class="hl">does not involve duplicating the underlying buffers</span>: only the relevant references and offsets, which represent the "view" of the wrapped memory, are updated. In high-performance code, spans are often used to avoid allocating strings unnecessarily». Замер через <code>GC.GetAllocatedBytesForCurrentThread()</code>: <code>arr.AsSpan(100,500)</code> прибавляет <b>0</b> байт (вью), а <code>arr[100..600]</code> (копирующий range на массиве) реально аллоцирует новый массив: <b>spanAllocates=False arrayCopyAllocates=True</b>, детерминированно 3/3. Практика: где раньше резали строку/массив копией (мусор для GC), теперь берут <code>Span</code>/<code>ReadOnlySpan</code> — тот же срез без единой аллокации.',
      sources: ["ms-span"],
    },
    {
      id: "s3", num: "03", kicker: "ref struct · стек-только", title: "Span — ref struct: стек-только, не сбежит в кучу",
      viewBox: "0 0 340 210", zones: REFSTRUCT_ZONES,
      code: ["Span<T> — это ref struct: аллоцируется на стеке, НЕ escape в кучу", "class C { Span<int> field; }   // ⛔ CS8345 — поле class не может быть Span", "// нельзя: элемент массива · боксинг · захват в лямбде · (в async — см. C# 13)"],
      scenes: [
        { codeLine: 0, caption: '<code>Span&lt;T&gt;</code> — <b>ref struct</b>: «allocate… on the stack, and they <span class="hl">can\'t escape to the managed heap</span>».', nodes: [{ id: "r", kind: "gate", at: { zone: "refstruct", row: 0 }, state: "ok", label: "ref struct", detail: "стек-только", accent: true }], edges: [] },
        { codeLine: 1, caption: 'Отсюда: <span class="hl">поле класса не может быть <code>Span&lt;T&gt;</code></span> — реальная ошибка компиляции <b>CS8345</b> (замер).', nodes: [{ id: "r", kind: "gate", at: { zone: "refstruct", row: 0 }, state: "ok", label: "ref struct", detail: "на стеке" }, { id: "f", kind: "gate", at: { zone: "refstruct", row: 1 }, state: "fail", label: "поле class", detail: "CS8345", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Также нельзя: элемент массива, боксинг, захват в лямбде/локальной функции. <span class="hl">В async — до C# 13 нельзя</span>, с C# 13 ослаблено (не в одном блоке с <code>await</code>).', nodes: [{ id: "r", kind: "gate", at: { zone: "refstruct", row: 0 }, state: "ok", label: "запреты", detail: "массив · boxing · лямбда" }, { id: "a", kind: "gate", at: { zone: "refstruct", row: 1 }, state: "fail", label: "async", detail: "до C# 13 — нет", accent: true }], edges: [] },
      ],
      explain: 'Почему у Span ограничения (verbatim, ref-struct): «You allocate instances of a <code>ref struct</code> type on the stack, and they <span class="hl">can\'t escape to the managed heap</span>. To ensure this property, the compiler limits the usage of <code>ref struct</code> types as follows: You can\'t use a <code>ref struct</code> as the element type of an array. <span class="hl">You can\'t declare a <code>ref struct</code> as the type of a field in a class or a non-<code>ref struct</code></span>. You can\'t box a <code>ref struct</code>… You can\'t capture a <code>ref struct</code> variable in a lambda expression or a local function». Про async (с версией): «<span class="hl">Before C# 13, you can\'t use <code>ref struct</code> variables in an <code>async</code> method</span>. Beginning with C# 13, a <code>ref struct</code> variable can\'t be used in the same block as the <code>await</code> expression». Замер подтверждает поле-запрет: <code>class C { Span&lt;int&gt; field; }</code> — <b>CS8345</b>. И «In .NET, examples of a <code>ref struct</code> are <code>System.Span&lt;T&gt;</code> and <code>System.ReadOnlySpan&lt;T&gt;</code>».',
      sources: ["ms-refstruct"],
    },
    {
      id: "s4", num: "04", kicker: "ReadOnlySpan + Memory", title: "ReadOnlySpan (иммутабельна, backed String) и Memory (на куче)",
      viewBox: "0 0 340 210", zones: RO_ZONES,
      code: ["ReadOnlySpan<char> s = \"hello world\".AsSpan(6);  // \"world\", 0 аллокаций", "Memory<T> m = arr.AsMemory();  // МОЖНО хранить на куче, годна для async", "// нужен async / поле класса → Memory<T>, не Span<T>"],
      scenes: [
        { codeLine: 0, caption: '<code>ReadOnlySpan&lt;T&gt;</code> — <span class="hl">иммутабельная</span> версия Span; её инстансы могут быть backed <code>String</code> (срез строки без аллокации).', nodes: [{ id: "r", kind: "gate", at: { zone: "ro", row: 0 }, state: "ok", label: "ReadOnlySpan<char>", detail: "backed String", accent: true }], edges: [] },
        { codeLine: 1, caption: '<code>Memory&lt;T&gt;</code> — <span class="hl">можно хранить на куче</span>: «has none of the limitations of Span<T>» → годна для async и полей класса.', nodes: [{ id: "r", kind: "gate", at: { zone: "ro", row: 0 }, state: "ok", label: "ReadOnlySpan", detail: "стек" }, { id: "m", kind: "gate", at: { zone: "mem", row: 0 }, state: "ok", label: "Memory<T>", detail: "куча · async OK", accent: true }], edges: [] },
        { codeLine: 2, caption: 'Правило выбора: синхронный срез в горячем коде → <span class="hl">Span</span>; нужно пережить <code>await</code> / лежать в поле → <span class="hl">Memory</span> (детали — S7.9).', nodes: [{ id: "s", kind: "gate", at: { zone: "ro", row: 0 }, state: "ok", label: "Span", detail: "sync, стек" }, { id: "m", kind: "gate", at: { zone: "mem", row: 0 }, state: "ok", label: "Memory", detail: "async, куча", accent: true }], edges: [] },
      ],
      explain: 'Иммутабельная версия и heap-вариант (verbatim): «<code>System.ReadOnlySpan&lt;T&gt;</code>, an immutable version of the <code>Span&lt;T&gt;</code> structure. <span class="hl">Instances can be also backed by a <code>String</code></span>». И <code>Memory&lt;T&gt;</code>: «A <code>Memory&lt;T&gt;</code> instance can be backed by an array of type <code>T</code> or a memory manager. <span class="hl">As it can be stored on the managed heap, <code>Memory&lt;T&gt;</code> has none of the limitations of <code>Span&lt;T&gt;</code></span>». То есть <code>ReadOnlySpan&lt;char&gt;</code> поверх <code>String</code> — способ резать строки без единой аллокации (замер: <code>"hello world".AsSpan(6)</code> → "world", 0 байт). А когда срез должен <b>пережить <code>await</code></b> или лежать в поле класса — берут <code>Memory&lt;T&gt;</code> (у неё нет стек-ограничений Span; ownership и guidelines — в S7.9).',
      sources: ["ms-span"],
    },
    {
      id: "s5", num: "05", kicker: "Машинная панель · реальный замер", title: "Span slice = 0 байт; IsByRefLike; поле = CS8345",
      viewBox: "0 0 340 210", zones: SIG_ZONES,
      code: ["arr.AsSpan(...)  → 0 байт кучи;  arr[a..b] → аллокация (spanAllocates=False)", "typeof(Span<int>).IsByRefLike  → True  (ref struct, стек-только)", "class C { Span<int> f; }  → CS8345 (поле не может быть Span)"],
      console: true,
      scenes: [
        { codeLine: 0, out: "", caption: 'Замер 1: срез <code>Span</code> — <span class="hl">0 байт кучи</span>, копия массива — аллокация: <code>spanAllocates=False arrayCopyAllocates=True</code>.', nodes: [{ id: "n", kind: "gate", at: { zone: "noalloc", row: 0 }, state: "ok", label: "Span/copy", detail: "False/True", accent: true }], edges: [] },
        { codeLine: 1, out: "", caption: 'Замер 2: <code>typeof(Span&lt;int&gt;).IsByRefLike</code> → <span class="hl">True</span> — Span это <b>ref struct</b> (стек-только), <code>IsValueType</code> тоже True.', nodes: [{ id: "n", kind: "gate", at: { zone: "noalloc", row: 0 }, state: "ok", label: "Span", detail: "0 байт" }, { id: "r", kind: "gate", at: { zone: "isref", row: 0 }, state: "ok", label: "IsByRefLike", detail: "True", accent: true }], edges: [] },
        { codeLine: 2, out: "spanAllocates=False arrayCopyAllocates=True · IsByRefLike=True · поле=CS8345", caption: 'Замер 3: поле <code>Span&lt;int&gt;</code> в классе — <span class="hl">компилятор отвергает</span>: <b>CS8345</b>. Три числа/факта — реальный рантайм и компилятор.', nodes: [{ id: "n", kind: "gate", at: { zone: "noalloc", row: 0 }, state: "ok", label: "0 байт", detail: "spanAllocates=False" }, { id: "r", kind: "gate", at: { zone: "isref", row: 0 }, state: "ok", label: "ref struct", detail: "поле=CS8345", accent: true }], edges: [] },
      ],
      explain: 'Машинная панель — три проверяемых факта про Span, снятые в рантайме и компиляторе. (1) <b>Без аллокации</b>: срез <code>arr.AsSpan(100,500)</code> добавляет <b>0</b> байт по <code>GC.GetAllocatedBytesForCurrentThread()</code>, а копирующий <code>arr[100..600]</code> — аллоцирует: <code>spanAllocates=False arrayCopyAllocates=True</code> (3/3). (2) <b>ref struct</b>: <code>typeof(Span&lt;int&gt;).IsByRefLike</code> → <b>True</b> (и <code>IsValueType</code> → True) — это тот самый by-ref-like value type, что живёт только на стеке. (3) <b>Стек-только на практике</b>: попытка объявить <code>Span&lt;int&gt;</code> полем класса — <b>ошибка компиляции CS8345</b> (текст компилятора CS8345: «Field or auto-implemented property cannot be of type Span&lt;int&gt;…»). Всё это следствие реализации Span через <code>ref</code>-поле (<code>ref T _reference</code> + <code>int _length</code>): ссылка не должна пережить референт, потому — стек-только. Числа реальны; Span — allocation-free вью, а не ещё один контейнер на куче.',
      sources: ["ms-span", "ms-refstruct"],
    },
  ],

  cards: [
    {
      id: "c1", type: "predict-output", engagementLevel: "responding",
      question: '<code>static (bool,bool) Measure(){ var arr=new int[1000]; long a0=GC.GetAllocatedBytesForCurrentThread(); Span&lt;int&gt; s=arr.AsSpan(100,500); s[0]=1; long a1=GC.GetAllocatedBytesForCurrentThread(); long b0=GC.GetAllocatedBytesForCurrentThread(); int[] copy=arr[100..600]; long b1=GC.GetAllocatedBytesForCurrentThread(); GC.KeepAlive(copy); return ((a1-a0)&gt;0,(b1-b0)&gt;0);} var(spanAlloc,copyAlloc)=Measure(); Console.WriteLine($"spanAllocates={spanAlloc} arrayCopyAllocates={copyAlloc}");</code> — что напечатает?',
      options: ["spanAllocates=False arrayCopyAllocates=True", "spanAllocates=True arrayCopyAllocates=True", "spanAllocates=False arrayCopyAllocates=False", "spanAllocates=True arrayCopyAllocates=False"], correctIndex: 0, xp: 10,
      okText: 'Срез <code>Span</code> — <span class="hl">вью, 0 байт кучи</span> («does not involve duplicating the underlying buffers»); <code>arr[100..600]</code> — копия в новый массив, аллоцирует. Печать: <b>spanAllocates=False arrayCopyAllocates=True</b>.',
      noText: 'Span — вью без аллокации; range-копия массива аллоцирует. Реальный вывод: <b>spanAllocates=False arrayCopyAllocates=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "spanAllocates=False arrayCopyAllocates=True" }, sourceRefs: ["ms-span"],
    },
    {
      id: "c2", type: "predict-output", engagementLevel: "responding",
      question: '<code>var t = typeof(Span&lt;int&gt;); Console.WriteLine($"spanIsValueType={t.IsValueType} spanIsRefStruct={t.IsByRefLike}");</code> — что напечатает?',
      options: ["spanIsValueType=True spanIsRefStruct=True", "spanIsValueType=False spanIsRefStruct=True", "spanIsValueType=True spanIsRefStruct=False", "spanIsValueType=False spanIsRefStruct=False"], correctIndex: 0, xp: 10,
      okText: '<code>Span&lt;T&gt;</code> — <b>ref struct</b> (<code>IsByRefLike=True</code>), это value type (<code>IsValueType=True</code>) → «You <span class="hl">allocate instances of a ref struct type on the stack, and they can\'t escape to the managed heap</span>». Печать: <b>spanIsValueType=True spanIsRefStruct=True</b>.',
      noText: 'Span — by-ref-like value type (ref struct). Реальный вывод: <b>spanIsValueType=True spanIsRefStruct=True</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "spanIsValueType=True spanIsRefStruct=True" }, sourceRefs: ["ms-refstruct"],
    },
    {
      id: "c3", type: "predict-output", engagementLevel: "responding",
      question: '<code>static (int,long) Slice(){ string str="hello world"; long a0=GC.GetAllocatedBytesForCurrentThread(); ReadOnlySpan&lt;char&gt; span=str.AsSpan(6); int len=span.Length; long a1=GC.GetAllocatedBytesForCurrentThread(); return (len,a1-a0);} var(len,bytes)=Slice(); Console.WriteLine($"sliceLen={len} allocatedBytes={bytes}");</code> — что напечатает?',
      options: ["sliceLen=5 allocatedBytes=0", "sliceLen=5 allocatedBytes=10", "sliceLen=6 allocatedBytes=0", "sliceLen=11 allocatedBytes=0"], correctIndex: 0, xp: 10,
      okText: '<code>ReadOnlySpan&lt;char&gt;</code> «Instances can be also backed by a <code>String</code>»: срез <code>"hello world".AsSpan(6)</code> = "world" (длина <b>5</b>), <b>0</b> аллокаций (вью в строку). Печать: <b>sliceLen=5 allocatedBytes=0</b>.',
      noText: 'ReadOnlySpan over String — срез без аллокации; с индекса 6 "world", длина 5. Реальный вывод: <b>sliceLen=5 allocatedBytes=0</b>.',
      verify: { kind: "exec", run: "dotnet run", expect: "sliceLen=5 allocatedBytes=0" }, sourceRefs: ["ms-span"],
    },
  ],

  takeaways: [
    { icon: "why", k: "Span = вью без аллокации", v: 'Span<T> — вью над непрерывной памятью (backed <code>T[]</code>/<code>stackalloc</code>/unmanaged); создание «<span class="hl">does not involve duplicating the underlying buffers</span>» → 0 байт кучи (замер: spanAllocates=False vs copy=True). Для срезов без мусора.' },
    { icon: "cost", k: "ref struct · стек-только", v: 'Span — <b>ref struct</b> (<code>IsByRefLike=True</code>): «You allocate instances of a ref struct type on the stack, and they <span class="hl">can\'t escape to the managed heap</span>». Нельзя: поле class (замер: CS8345), элемент массива, боксинг, лямбда, async (до C# 13; с C# 13 — не в одном блоке с <code>await</code>).' },
    { icon: "avoid", k: "ReadOnlySpan / Memory", v: '<code>ReadOnlySpan&lt;T&gt;</code> — иммутабельна, backed <code>String</code> (срез строки, 0 байт — замер). Нужен async / поле / куча → <code>Memory&lt;T&gt;</code>: «<span class="hl">none of the limitations of Span<T></span>» (S7.9). Span ≠ Memory.' },
  ],

  foot: 'урок · <b>Span<T>/ReadOnlySpan<T></b> · 5 анимир. разборов · панель реального замера (0 байт, IsByRefLike, CS8345) · дизайн <b>mid</b>',
};
