/**
 * Lesson registry (ADR-0003 lazy chunks + ADR-0004 track/section model).
 *
 * The ONE place tracks, sections and lessons are declared. Each lesson body is a
 * SEPARATE chunk loaded on demand via a dynamic `import()` — Vite emits one JS chunk
 * per lesson, so the INITIAL bundle no longer carries every lesson body (G1: initial
 * chunk stays under the baseline as the corpus grows). Only LIGHTWEIGHT metadata
 * (id / track / section / title / kicker / home-icon / est. minutes / card count)
 * lives in the initial chunk, in each `LessonManifestEntry`.
 *
 * Loading model:
 *   - `entry.load()` dynamic-imports the body chunk once and MEMOISES it (BODY_CACHE),
 *     so a lesson is fetched from the network at most once per session.
 *   - `prefetchSection(id)` (called at boot for the first-session section, non-blocking;
 *     ADR-0005) warms only THAT section's bodies in the background — not the whole catalog —
 *     so `getLoadedBody(id)` returns them SYNCHRONOUSLY for the runner. A lesson opened before
 *     its prefetch settled (or outside the warmed section) is loaded on demand via `loadBody(id)`.
 *
 * See docs/AUTHORING-AI.md for the authoring playbook and app/src/lessons/types.ts
 * for the LessonData shape a body chunk must export.
 */
import type { LessonData, LessonIcon, LessonLang } from "./types.ts";
import { S } from "../strings.ts";

/** Lightweight, initial-chunk metadata for one lesson. The body is loaded via `load()`. */
export interface LessonManifestEntry {
  /** Lesson id — matches the backend seed lessonId (e.g. "CS.S1.value-types-copy"). */
  id: string;
  /** Slug segment of the id (the part after the section prefix). */
  slug: string;
  /** Track id this lesson belongs to (e.g. "CS", "PY", legacy "T1"/"T2"). */
  track: string;
  /** Section id (e.g. "CS.S1"); a flat track uses its track id. */
  section: string;
  /** Lesson title (RU) — shown on home / progress without loading the body. */
  title: string;
  /** Short kicker above the lesson title. */
  kicker: string;
  /** Home-row icon key. */
  icon: LessonIcon;
  /** Home-row subtitle. */
  subtitle: string;
  /** Estimated minutes (home meta). */
  estMinutes: number;
  /** Number of SRS cards (drives per-lesson progress without loading the body). */
  cards: number;
  /** Code language (badge / highlighting); default "csharp". */
  lang?: LessonLang;
  /** Dynamic-import the lesson body chunk (memoised). */
  load: () => Promise<LessonData>;
}

/** A curriculum section: an ordered group of lessons with section prerequisites. */
export interface Section {
  id: string;
  title: string;
  /** Ordering within the track (and the new-card release order, ADR-0002). */
  order: number;
  /** Section ids that should come before this one (soft recommendation, no hard lock in wave 1). */
  prereqs: string[];
  lessons: LessonManifestEntry[];
}

/** A track: a titled group of sections rendered as one home group. */
export interface Track {
  id: string;
  title: string;
  /** Optional one-line track subtitle. */
  sub?: string;
  /** Optional badge (e.g. «новый»). */
  badge?: string;
  sections: Section[];
}

// ---------------------------------------------------------------------------
// Body cache + loading. `load()` on each entry memoises its own dynamic import;
// the registry mirrors resolved bodies into BODY_CACHE keyed by id so the runner
// can read them synchronously after boot-time prefetch.
// ---------------------------------------------------------------------------
const BODY_CACHE = new Map<string, LessonData>();

/** Wrap a raw dynamic-import thunk so it caches its resolved body by id (idempotent). */
function memoise(id: string, thunk: () => Promise<LessonData>): () => Promise<LessonData> {
  let inflight: Promise<LessonData> | null = null;
  return () => {
    const cached = BODY_CACHE.get(id);
    if (cached) return Promise.resolve(cached);
    if (inflight) return inflight;
    inflight = thunk().then((body) => {
      BODY_CACHE.set(id, body);
      inflight = null;
      return body;
    });
    return inflight;
  };
}

/** Build a manifest entry from a lesson id + its metadata + a dynamic-import thunk. */
function entry(
  meta: Omit<LessonManifestEntry, "load" | "slug">,
  thunk: () => Promise<LessonData>,
): LessonManifestEntry {
  const dot = meta.id.lastIndexOf(".");
  const slug = dot >= 0 ? meta.id.slice(dot + 1) : meta.id;
  return { ...meta, slug, load: memoise(meta.id, thunk) };
}

// ===========================================================================
// TRACK / SECTION / LESSON DECLARATIONS
// ===========================================================================
//
// New C# track "CS" (ADR-0004): sectioned, wave-1 sections S1/S2/S7/S17/S18/S4.
// The legacy T1/T2 C# lessons were retired in the F2 migration; Python PY.* lessons are
// a flat group (untouched, G5). Every `import()` is a self-contained chunk — Vite
// code-splits automatically.

const CS_S1: Section = {
  id: "CS.S1",
  title: "Типовая система",
  order: 1,
  prereqs: [],
  // Lessons are registered as their body files land (F1: value-types-copy; F6: type-system-map,
  // classes-virtual-dispatch). Kept as its own section so navigation groups them from day one.
  // Curriculum order S1.1 -> S1.2 -> S1.3.
  lessons: [
    entry(
      {
        id: "CS.S1.type-system-map",
        track: "CS",
        section: "CS.S1",
        title: "Карта типовой системы",
        kicker: "C# вглубь · S1 · тип во времени",
        icon: "types",
        subtitle: "CTS, compile-time vs run-time тип",
        estMinutes: 8,
        cards: 2,
      },
      () => import("./cs/type-system-map.ts").then((m) => m.typeSystemMap),
    ),
    entry(
      {
        id: "CS.S1.value-types-copy",
        track: "CS",
        section: "CS.S1",
        title: "Семантика копирования value types",
        kicker: "C# вглубь · S1 · стек/куча",
        icon: "types",
        subtitle: "Копия при присваивании, layout, машинная панель",
        estMinutes: 9,
        cards: 3,
      },
      () => import("./cs/value-types-copy.ts").then((m) => m.valueTypesCopy),
    ),
    entry(
      {
        id: "CS.S1.classes-virtual-dispatch",
        track: "CS",
        section: "CS.S1",
        title: "Классы и виртуальная диспетчеризация",
        kicker: "C# вглубь · S1 · method table",
        icon: "types",
        subtitle: "vtable, override, невиртуальный вызов",
        estMinutes: 9,
        cards: 2,
      },
      () => import("./cs/classes-virtual-dispatch.ts").then((m) => m.classesVirtualDispatch),
    ),
    entry(
      {
        id: "CS.S1.structs-traps",
        track: "CS",
        section: "CS.S1",
        title: "Структуры: ловушки value-семантики",
        kicker: "C# вглубь · S1 · defensive copy",
        icon: "types",
        subtitle: "readonly struct, защитная копия, мутабельные ловушки",
        estMinutes: 10,
        cards: 3,
      },
      () => import("./cs/structs-traps.ts").then((m) => m.structsTraps),
    ),
    entry(
      {
        id: "CS.S1.records",
        track: "CS",
        section: "CS.S1",
        title: "Records: value equality и синтез компилятора",
        kicker: "C# вглубь · S1 · синтез методов",
        icon: "types",
        subtitle: "Value equality, with, синтез Equals/Deconstruct",
        estMinutes: 9,
        cards: 3,
      },
      () => import("./cs/records.ts").then((m) => m.records),
    ),
    entry(
      {
        id: "CS.S1.interfaces-dim",
        track: "CS",
        section: "CS.S1",
        title: "Интерфейсы: explicit-реализация и DIM",
        kicker: "C# вглубь · S1 · диспетчер контракта",
        icon: "types",
        subtitle: "explicit vs implicit, default interface methods",
        estMinutes: 10,
        cards: 3,
      },
      () => import("./cs/interfaces-dim.ts").then((m) => m.interfacesDim),
    ),
    entry(
      {
        id: "CS.S1.enum-flags",
        track: "CS",
        section: "CS.S1",
        title: "Enum и [Flags]: value type под именами",
        kicker: "C# вглубь · S1 · биты и боксинг",
        icon: "types",
        subtitle: "underlying type, [Flags], боксинг, приведения",
        estMinutes: 9,
        cards: 3,
      },
      () => import("./cs/enum-flags.ts").then((m) => m.enumFlags),
    ),
    entry(
      {
        id: "CS.S1.generics-basics",
        track: "CS",
        section: "CS.S1",
        title: "Generics: механика и constraints",
        kicker: "C# вглубь · S1 · без боксинга",
        icon: "types",
        subtitle: "type safety, open/closed, where, без боксинга",
        estMinutes: 10,
        cards: 3,
      },
      () => import("./cs/generics-basics.ts").then((m) => m.genericsBasics),
    ),
    entry(
      {
        id: "CS.S1.nullable",
        track: "CS",
        section: "CS.S1",
        title: "Nullable<T>: value type, который умеет null",
        kicker: "C# вглубь · S1 · структура под T?",
        icon: "types",
        subtitle: "Nullable<T> struct, боксинг, lifted operators",
        estMinutes: 9,
        cards: 3,
      },
      () => import("./cs/nullable.ts").then((m) => m.nullable),
    ),
    entry(
      {
        id: "CS.S1.casts",
        track: "CS",
        section: "CS.S1",
        title: "Приведения: is / as / cast / typeof",
        kicker: "C# вглубь · S1 · три поведения",
        icon: "types",
        subtitle: "is (bool), as (null), cast (бросает), typeof",
        estMinutes: 9,
        cards: 3,
      },
      () => import("./cs/casts.ts").then((m) => m.casts),
    ),
  ],
};

// Section S2 «Async/Await и Task» (RS-03 §2 раздел 2 · 9 уроков). Prereq S1 → S2 is a soft
// recommendation (design «Опыт»: S1 → S7 → S17 → S18 → S2); ordered after S1 in the curriculum.
const CS_S2: Section = {
  id: "CS.S2",
  title: "Async/Await и Task",
  order: 2,
  prereqs: ["CS.S1"],
  lessons: [
    entry(
      {
        id: "CS.S2.tap-model",
        track: "CS",
        section: "CS.S2",
        title: "TAP-модель: async/await как абстракция",
        kicker: "C# вглубь · S2 · async ≠ поток",
        icon: "async",
        subtitle: "async/await, приостановка, Task, без потоков",
        estMinutes: 10,
        cards: 3,
      },
      () => import("./cs/tap-model.ts").then((m) => m.tapModel),
    ),
    entry(
      {
        id: "CS.S2.composition",
        track: "CS",
        section: "CS.S2",
        title: "Композиция: старт, WhenAll, WhenAny",
        kicker: "C# вглубь · S2 · конкурентность",
        icon: "async",
        subtitle: "старт задач, WhenAll/WhenAny, faulted",
        estMinutes: 10,
        cards: 3,
      },
      () => import("./cs/composition.ts").then((m) => m.composition),
    ),
    entry(
      {
        id: "CS.S2.io-vs-cpu",
        track: "CS",
        section: "CS.S2",
        title: "I/O-bound vs CPU-bound: когда Task.Run",
        kicker: "C# вглубь · S2 · решение о потоке",
        icon: "async",
        subtitle: "await без Task.Run vs Task.Run на пул, замер",
        estMinutes: 9,
        cards: 3,
      },
      () => import("./cs/io-vs-cpu.ts").then((m) => m.ioVsCpu),
    ),
    entry(
      {
        id: "CS.S2.return-types",
        track: "CS",
        section: "CS.S2",
        title: "Async return types: Task, Task<T>, void",
        kicker: "C# вглубь · S2 · что возвращать",
        icon: "async",
        subtitle: "Task/Task<T>/void, async void, task-like",
        estMinutes: 9,
        cards: 3,
      },
      () => import("./cs/return-types.ts").then((m) => m.returnTypes),
    ),
    entry(
      {
        id: "CS.S2.valuetask",
        track: "CS",
        section: "CS.S2",
        title: "ValueTask<T>: когда брать и его ограничения",
        kicker: "C# вглубь · S2 · горячий путь",
        icon: "async",
        subtitle: "value type вместо Task, await один раз, трейдофы",
        estMinutes: 9,
        cards: 3,
      },
      () => import("./cs/valuetask.ts").then((m) => m.valueTask),
    ),
    entry(
      {
        id: "CS.S2.tap-contract",
        track: "CS",
        section: "CS.S2",
        title: "TAP-контракт изнутри: hot, статусы, автомат",
        kicker: "C# вглубь · S2 · уровень ниже",
        icon: "async",
        subtitle: "hot task, sync до await, статусы, стейт-машина",
        estMinutes: 10,
        cards: 3,
      },
      () => import("./cs/tap-contract.ts").then((m) => m.tapContract),
    ),
    entry(
      {
        id: "CS.S2.exceptions",
        track: "CS",
        section: "CS.S2",
        title: "Исключения в async: await vs .Wait, WhenAll",
        kicker: "C# вглубь · S2 · ошибки в задаче",
        icon: "async",
        subtitle: "await разворачивает, .Wait оборачивает, WhenAll, Flatten",
        estMinutes: 10,
        cards: 3,
      },
      () => import("./cs/exceptions.ts").then((m) => m.exceptions),
    ),
    entry(
      {
        id: "CS.S2.cancellation",
        track: "CS",
        section: "CS.S2",
        title: "Кооперативная отмена: токен, ThrowIf, статусы",
        kicker: "C# вглубь · S2 · отмена не убивает поток",
        icon: "async",
        subtitle: "CancellationToken, ThrowIfCancellationRequested, linked, статусы",
        estMinutes: 10,
        cards: 3,
      },
      () => import("./cs/cancellation.ts").then((m) => m.cancellation),
    ),
    entry(
      {
        id: "CS.S2.async-streams",
        track: "CS",
        section: "CS.S2",
        title: "Async streams: IAsyncEnumerable, await foreach",
        kicker: "C# вглубь · S2 · поток по требованию",
        icon: "async",
        subtitle: "async yield return, await foreach, лениво, WithCancellation",
        estMinutes: 10,
        cards: 3,
      },
      () => import("./cs/async-streams.ts").then((m) => m.asyncStreams),
    ),
  ],
};

// Section S7 «Память и GC» (RS-03 §2 раздел 7 · 10 уроков). Curriculum recommendation
// (design «Опыт»: S1 → S7 → S17 → S18 → S2); ordered after S2 in the catalog.
const CS_S7: Section = {
  id: "CS.S7",
  title: "Память и GC",
  order: 7,
  prereqs: ["CS.S1"],
  lessons: [
    entry(
      {
        id: "CS.S7.gc-overview",
        track: "CS",
        section: "CS.S7",
        title: "Garbage Collector: автоматический менеджер памяти",
        kicker: "C# вглубь · S7 · память ниже абстракции",
        icon: "gc",
        subtitle: "GC = авто-менеджер, roots, аллокация, когда сбор",
        estMinutes: 10,
        cards: 3,
      },
      () => import("./cs/gc-overview.ts").then((m) => m.gcOverview),
    ),
    entry(
      {
        id: "CS.S7.generations",
        track: "CS",
        section: "CS.S7",
        title: "Поколения GC: gen0/1/2, managed heap, продвижение",
        kicker: "C# вглубь · S7 · поколения кучи",
        icon: "gc",
        subtitle: "три поколения, продвижение, gen2 = full GC",
        estMinutes: 10,
        cards: 3,
      },
      () => import("./cs/generations.ts").then((m) => m.generations),
    ),
    entry(
      {
        id: "CS.S7.workstation-server",
        track: "CS",
        section: "CS.S7",
        title: "Workstation vs Server GC, concurrent/background",
        kicker: "C# вглубь · S7 · флейворы GC",
        icon: "gc",
        subtitle: "два флейвора, heap на CPU, concurrent/background",
        estMinutes: 10,
        cards: 3,
      },
      () => import("./cs/workstation-server.ts").then((m) => m.workstationServer),
    ),
    entry(
      {
        id: "CS.S7.latency-modes",
        track: "CS",
        section: "CS.S7",
        title: "Latency-режимы GC: LowLatency, SustainedLowLatency",
        kicker: "C# вглубь · S7 · пауза сборщика",
        icon: "gc",
        subtitle: "GCLatencyMode, подавление gen2, трейдофы",
        estMinutes: 10,
        cards: 3,
      },
      () => import("./cs/latency-modes.ts").then((m) => m.latencyModes),
    ),
    entry(
      {
        id: "CS.S7.loh",
        track: "CS",
        section: "CS.S7",
        title: "Large Object Heap: порог 85000, gen2, sweep",
        kicker: "C# вглубь · S7 · большие объекты",
        icon: "gc",
        subtitle: "порог 85000, LOH=gen2, не компактится, CompactOnce",
        estMinutes: 10,
        cards: 3,
      },
      () => import("./cs/loh.ts").then((m) => m.loh),
    ),
    entry(
      {
        id: "CS.S7.finalizers-dispose",
        track: "CS",
        section: "CS.S7",
        title: "Финализаторы и Dispose: паттерн, SuppressFinalize",
        kicker: "C# вглубь · S7 · очистка ресурсов",
        icon: "gc",
        subtitle: "финализатор=fallback, Dispose pattern, SuppressFinalize, SafeHandle",
        estMinutes: 10,
        cards: 3,
      },
      () => import("./cs/finalizers-dispose.ts").then((m) => m.finalizersDispose),
    ),
    entry(
      {
        id: "CS.S7.weak-references",
        track: "CS",
        section: "CS.S7",
        title: "Weak references: short/long, Target, resurrection",
        kicker: "C# вглубь · S7 · слабые ссылки",
        icon: "gc",
        subtitle: "weak ref разрешает сбор, short/long, Target",
        estMinutes: 10,
        cards: 3,
      },
      () => import("./cs/weak-references.ts").then((m) => m.weakReferences),
    ),
    entry(
      {
        id: "CS.S7.span-memory",
        track: "CS",
        section: "CS.S7",
        title: "Span<T>/ReadOnlySpan<T>: ref struct, без аллокаций",
        kicker: "C# вглубь · S7 · вью без аллокаций",
        icon: "gc",
        subtitle: "Span=вью без аллокации, ref struct, стек-только, Memory",
        estMinutes: 10,
        cards: 3,
      },
      () => import("./cs/span-memory.ts").then((m) => m.spanMemory),
    ),
    entry(
      {
        id: "CS.S7.memory-guidelines",
        track: "CS",
        section: "CS.S7",
        title: "Memory<T>: владение, аренда, usage-guidelines",
        kicker: "C# вглубь · S7 · владение буфером",
        icon: "gc",
        subtitle: "Memory на куче, ownership/lease, Rule #1, IMemoryOwner",
        estMinutes: 10,
        cards: 3,
      },
      () => import("./cs/memory-guidelines.ts").then((m) => m.memoryGuidelines),
    ),
    entry(
      {
        id: "CS.S7.stackalloc-refstruct",
        track: "CS",
        section: "CS.S7",
        title: "stackalloc и ref struct: стек, ограничения",
        kicker: "C# вглубь · S7 · аллокация на стеке",
        icon: "gc",
        subtitle: "stackalloc на стеке, Span без unsafe, лимиты, ref struct",
        estMinutes: 10,
        cards: 3,
      },
      () => import("./cs/stackalloc-refstruct.ts").then((m) => m.stackallocRefstruct),
    ),
  ],
};

// Section S17 «Внутренности коллекций» (RS-03 §2 раздел 17 · 7 уроков). Prereq CS.S1;
// ordered after S7 in the catalog (curriculum «Опыт»: S1 → S7 → S17 → S18 → S2).
const CS_S17: Section = {
  id: "CS.S17",
  title: "Внутренности коллекций",
  order: 17,
  prereqs: ["CS.S1"],
  lessons: [
    entry(
      { id: "CS.S17.collections-overview", track: "CS", section: "CS.S17", title: "Обзор коллекций .NET: generic vs non-generic", kicker: "C# вглубь · S17 · карта семейств", icon: "collections", subtitle: "generic vs non-generic, контракт, цена боксинга", estMinutes: 9, cards: 3 },
      () => import("./cs/collections-overview.ts").then((m) => m.collectionsOverview),
    ),
    entry(
      { id: "CS.S17.choosing-collection", track: "CS", section: "CS.S17", title: "Выбор коллекции: алгоритмическая сложность", kicker: "C# вглубь · S17 · O() решает", icon: "collections", subtitle: "amortized vs worst-case, List vs Dictionary vs HashSet", estMinutes: 10, cards: 3 },
      () => import("./cs/choosing-collection.ts").then((m) => m.choosingCollection),
    ),
    entry(
      { id: "CS.S17.dictionary-internals", track: "CS", section: "CS.S17", title: "Dictionary изнутри: бакеты, хеш, коллизии", kicker: "C# вглубь · S17 · хеш-таблица", icon: "collections", subtitle: "бакеты, GetHashCode/Equals, resize, коллизии", estMinutes: 11, cards: 3 },
      () => import("./cs/dictionary-internals.ts").then((m) => m.dictionaryInternals),
    ),
    entry(
      { id: "CS.S17.list-internals", track: "CS", section: "CS.S17", title: "List<T> изнутри: массив, Capacity, рост", kicker: "C# вглубь · S17 · массив под капотом", icon: "collections", subtitle: "int[] под капотом, Capacity/Count, амортизированный Add", estMinutes: 10, cards: 3 },
      () => import("./cs/list-internals.ts").then((m) => m.listInternals),
    ),
    entry(
      { id: "CS.S17.hashset", track: "CS", section: "CS.S17", title: "HashSet<T>: множество и O(1) Contains", kicker: "C# вглубь · S17 · Dictionary без значений", icon: "collections", subtitle: "уникальность, Contains O(1), set-операции", estMinutes: 9, cards: 3 },
      () => import("./cs/hashset.ts").then((m) => m.hashSet),
    ),
    entry(
      { id: "CS.S17.concurrent-collections", track: "CS", section: "CS.S17", title: "Concurrent-коллекции: fine-grained, lock-free", kicker: "C# вглубь · S17 · цена синхронизации", icon: "collections", subtitle: "ConcurrentDictionary/Queue/Bag, GetOrAdd, снимок", estMinutes: 11, cards: 3 },
      () => import("./cs/concurrent-collections.ts").then((m) => m.concurrentCollections),
    ),
    entry(
      { id: "CS.S17.immutable-collections", track: "CS", section: "CS.S17", title: "Immutable-коллекции: структурное разделение", kicker: "C# вглубь · S17 · дерево вместо копии", icon: "collections", subtitle: "новый объект на мутацию, ImmutableArray vs List, Builder", estMinutes: 11, cards: 3 },
      () => import("./cs/immutable-collections.ts").then((m) => m.immutableCollections),
    ),
  ],
};

// Section S18 «Итераторы и yield» (RS-03 §2 раздел 18 · 4 урока). Prereq CS.S1.
const CS_S18: Section = {
  id: "CS.S18",
  title: "Итераторы и yield",
  order: 18,
  prereqs: ["CS.S1"],
  lessons: [
    entry(
      { id: "CS.S18.iterators-overview", track: "CS", section: "CS.S18", title: "Итераторы и ленивое исполнение", kicker: "C# вглубь · S18 · вызов ≠ исполнение", icon: "async", subtitle: "yield return, ленивость, foreach/await foreach", estMinutes: 10, cards: 3 },
      () => import("./cs/iterators-overview.ts").then((m) => m.iteratorsOverview),
    ),
    entry(
      { id: "CS.S18.yield-contract", track: "CS", section: "CS.S18", title: "Контракт yield: return, break, где нельзя", kicker: "C# вглубь · S18 · правила yield", icon: "async", subtitle: "yield return/break, типы возврата, запреты", estMinutes: 10, cards: 3 },
      () => import("./cs/yield-contract.ts").then((m) => m.yieldContract),
    ),
    entry(
      { id: "CS.S18.iterator-state-machine", track: "CS", section: "CS.S18", title: "Стейт-машина итератора: во что компилятор превращает yield", kicker: "C# вглубь · S18 · nested-класс = автомат", icon: "async", subtitle: "MoveNext/Current, <>1__state, Reset → NotSupported", estMinutes: 11, cards: 3 },
      () => import("./cs/iterator-state-machine.ts").then((m) => m.iteratorStateMachine),
    ),
    entry(
      { id: "CS.S18.async-iterator-statemachine", track: "CS", section: "CS.S18", title: "Async-итератор изнутри: AsyncIteratorMethodBuilder", kicker: "C# вглубь · S18 · итератор + async автомат", icon: "async", subtitle: "IAsyncStateMachine, AsyncIteratorMethodBuilder, комбинация", estMinutes: 11, cards: 3 },
      () => import("./cs/async-iterator-statemachine.ts").then((m) => m.asyncIteratorStatemachine),
    ),
  ],
};

// Section S4 «Замыкания» (RS-03 §2 раздел 4 · 1 урок). Prereq CS.S1.
const CS_S4: Section = {
  id: "CS.S4",
  title: "Замыкания",
  order: 4,
  prereqs: ["CS.S1"],
  lessons: [
    entry(
      { id: "CS.S4.delegates-overview", track: "CS", section: "CS.S4", title: "Делегаты: type-safe function pointer", kicker: "C# вглубь · S4 · позднее связывание", icon: "types", subtitle: "Делегат = ссылка на метод, типобезопасность, MulticastDelegate", estMinutes: 9, cards: 3 },
      () => import("./cs/delegates-overview.ts").then((m) => m.delegatesOverview),
    ),
    entry(
      { id: "CS.S4.delegate-multicast", track: "CS", section: "CS.S4", title: "Multicast: invocation list, +=/-=", kicker: "C# вглубь · S4 · цепочка методов", icon: "types", subtitle: "Объявление, instantiation, invocation list, +=/-=, ловушки", estMinutes: 10, cards: 3 },
      () => import("./cs/delegate-multicast.ts").then((m) => m.delegateMulticast),
    ),
    entry(
      { id: "CS.S4.func-action-predicate", track: "CS", section: "CS.S4", title: "Func, Action, Predicate: встроенные делегаты", kicker: "C# вглубь · S4 · без своего delegate", icon: "types", subtitle: "Func (возврат), Action (void), Predicate (bool), арность, вариантность", estMinutes: 9, cards: 3 },
      () => import("./cs/func-action-predicate.ts").then((m) => m.funcActionPredicate),
    ),
    entry(
      { id: "CS.S4.events", track: "CS", section: "CS.S4", title: "События: event, EventHandler, publish/subscribe", kicker: "C# вглубь · S4 · observer", icon: "types", subtitle: "event поверх делегата, publisher/subscriber, EventHandler, инкапсуляция", estMinutes: 11, cards: 3 },
      () => import("./cs/events.ts").then((m) => m.events),
    ),
    entry(
      { id: "CS.S4.delegate-variance", track: "CS", section: "CS.S4", title: "Вариантность делегатов: ковариантность и контравариантность", kicker: "C# вглубь · S4 · in/out", icon: "types", subtitle: "Ковариантность возврата, контравариантность параметра, out/in, type safety", estMinutes: 10, cards: 3 },
      () => import("./cs/delegate-variance.ts").then((m) => m.delegateVariance),
    ),
    entry(
      { id: "CS.S4.async-event-handlers", track: "CS", section: "CS.S4", title: "Async event handlers: async void и его ловушки", kicker: "C# вглубь · S4 · async void", icon: "async", subtitle: "async void только для обработчиков, исключения, fire-and-forget, async-λ в LINQ", estMinutes: 11, cards: 3 },
      () => import("./cs/async-event-handlers.ts").then((m) => m.asyncEventHandlers),
    ),
    entry(
      { id: "CS.S4.closures-capture", track: "CS", section: "CS.S4", title: "Лямбды и замыкания: захват переменной", kicker: "C# вглубь · S4 · display-класс", icon: "types", subtitle: "Захват переменной, ловушка цикла, аллокация замыкания", estMinutes: 11, cards: 3 },
      () => import("./cs/closures-capture.ts").then((m) => m.closuresCapture),
    ),
  ],
};

// Section S3 «LINQ» (RS-03 §2 раздел 3 · 8 уроков). Prereq CS.S1. Order 3: LINQ идёт
// сразу за async/generics (S2) и перед pattern-matching (S5) по curriculum.
const CS_S3: Section = {
  id: "CS.S3",
  title: "LINQ",
  order: 3,
  prereqs: ["CS.S1"],
  lessons: [
    entry(
      { id: "CS.S3.linq-query-syntax", track: "CS", section: "CS.S3", title: "LINQ: query-синтаксис и method-синтаксис", kicker: "C# вглубь · S3 · две формы — один запрос", icon: "collections", subtitle: "query expression, лоуэринг в методы, где метод обязателен", estMinutes: 9, cards: 3 },
      () => import("./cs/linq-query-syntax.ts").then((m) => m.linqQuerySyntax),
    ),
    entry(
      { id: "CS.S3.linq-execution", track: "CS", section: "CS.S3", title: "Как выполняется LINQ-запрос: три части", kicker: "C# вглубь · S3 · объявить ≠ исполнить", icon: "collections", subtitle: "три действия, query-переменная = рецепт, исполнение при итерации", estMinutes: 9, cards: 3 },
      () => import("./cs/linq-execution.ts").then((m) => m.linqExecution),
    ),
    entry(
      { id: "CS.S3.standard-operators", track: "CS", section: "CS.S3", title: "Стандартные операторы: Where, Select, GroupBy, Join", kicker: "C# вглубь · S3 · семейства операторов", icon: "collections", subtitle: "фильтр/проекция/группировка/join, extension-методы, композиция", estMinutes: 10, cards: 3 },
      () => import("./cs/standard-operators.ts").then((m) => m.standardOperators),
    ),
    entry(
      { id: "CS.S3.deferred-execution", track: "CS", section: "CS.S3", title: "Отложенное выполнение: streaming vs buffering", kicker: "C# вглубь · S3 · когда РЕАЛЬНО бежит", icon: "collections", subtitle: "deferred, streaming/nonstreaming, immediate, счётчик итераций", estMinutes: 11, cards: 3 },
      () => import("./cs/deferred-execution.ts").then((m) => m.deferredExecution),
    ),
    entry(
      { id: "CS.S3.ienumerable-iqueryable", track: "CS", section: "CS.S3", title: "IEnumerable<T> vs IQueryable<T>: делегаты и деревья выражений", kicker: "C# вглубь · S3 · где бежит запрос", icon: "collections", subtitle: "делегат vs expression tree, in-memory vs provider, где исполняется", estMinutes: 10, cards: 3 },
      () => import("./cs/ienumerable-iqueryable.ts").then((m) => m.ienumerableIqueryable),
    ),
    entry(
      { id: "CS.S3.linq-providers", track: "CS", section: "CS.S3", title: "LINQ-провайдеры: in-memory и удалённые", kicker: "C# вглубь · S3 · один синтаксис — разные бэкенды", icon: "collections", subtitle: "LINQ to Objects, IQueryable-провайдеры, спектр сложности, EF Core→SQL", estMinutes: 10, cards: 3 },
      () => import("./cs/linq-providers.ts").then((m) => m.linqProviders),
    ),
    entry(
      { id: "CS.S3.plinq", track: "CS", section: "CS.S3", title: "PLINQ: параллельные запросы, порядок, партиционирование", kicker: "C# вглубь · S3 · LINQ на всех ядрах", icon: "collections", subtitle: "AsParallel, партиционирование, консервативность, AsOrdered, ForAll", estMinutes: 11, cards: 3 },
      () => import("./cs/plinq.ts").then((m) => m.plinq),
    ),
    entry(
      { id: "CS.S3.custom-operators", track: "CS", section: "CS.S3", title: "Кастомные операторы LINQ: extension-методы", kicker: "C# вглубь · S3 · расширяем LINQ сами", icon: "collections", subtitle: "extension-метод, this-параметр, deferred через yield, приоритет instance", estMinutes: 10, cards: 3 },
      () => import("./cs/custom-operators.ts").then((m) => m.customOperators),
    ),
  ],
};

// Section S5 «Pattern Matching» (RS-03 §2 раздел 5 · 7 уроков). Prereq CS.S1.
const CS_S5: Section = {
  id: "CS.S5",
  title: "Сопоставление с образцом",
  order: 5,
  prereqs: ["CS.S1"],
  lessons: [
    entry(
      { id: "CS.S5.pattern-overview", track: "CS", section: "CS.S5", title: "Pattern matching: обзор и null-проверки", kicker: "C# вглубь · S5 · тест по признакам", icon: "types", subtitle: "is / switch, null-паттерны, exhaustiveness", estMinutes: 9, cards: 3 },
      () => import("./cs/pattern-overview.ts").then((m) => m.patternOverview),
    ),
    entry(
      { id: "CS.S5.pattern-vocabulary", track: "CS", section: "CS.S5", title: "Словарь паттернов: полный набор", kicker: "C# вглубь · S5 · карта паттернов", icon: "types", subtitle: "declaration/type/constant/relational/logical/property/positional/list", estMinutes: 10, cards: 3 },
      () => import("./cs/pattern-vocabulary.ts").then((m) => m.patternVocabulary),
    ),
    entry(
      { id: "CS.S5.switch-expressions", track: "CS", section: "CS.S5", title: "Switch expressions и exhaustiveness", kicker: "C# вглубь · S5 · рукава и полнота", icon: "types", subtitle: "рукава, case guard when, порядок текста, полнота", estMinutes: 10, cards: 3 },
      () => import("./cs/switch-expressions.ts").then((m) => m.switchExpressions),
    ),
    entry(
      { id: "CS.S5.is-declaration", track: "CS", section: "CS.S5", title: "is-оператор и declaration patterns", kicker: "C# вглубь · S5 · тест типа + bind", icon: "types", subtitle: "is bool, declaration/type pattern, null → false, scope", estMinutes: 9, cards: 3 },
      () => import("./cs/is-declaration.ts").then((m) => m.isDeclaration),
    ),
    entry(
      { id: "CS.S5.relational-logical", track: "CS", section: "CS.S5", title: "Relational и logical patterns", kicker: "C# вглубь · S5 · диапазоны и комбинаторы", icon: "types", subtitle: "< > <= >=, not/and/or, precedence, скобки", estMinutes: 10, cards: 3 },
      () => import("./cs/relational-logical.ts").then((m) => m.relationalLogical),
    ),
    entry(
      { id: "CS.S5.property-positional", track: "CS", section: "CS.S5", title: "Property и positional patterns, Deconstruct", kicker: "C# вглубь · S5 · паттерны по форме", icon: "types", subtitle: "property {}, positional (), Deconstruct, extended", estMinutes: 11, cards: 3 },
      () => import("./cs/property-positional.ts").then((m) => m.propertyPositional),
    ),
    entry(
      { id: "CS.S5.list-patterns", track: "CS", section: "CS.S5", title: "List patterns и slice", kicker: "C# вглубь · S5 · форма последовательности", icon: "types", subtitle: "[..], discard/var в списке, slice .., один slice", estMinutes: 10, cards: 3 },
      () => import("./cs/list-patterns.ts").then((m) => m.listPatterns),
    ),
  ],
};

// Section S6 «Reflection» (RS-03 §2 раздел 6 · 7 уроков). Prereq CS.S1.
const CS_S6: Section = {
  id: "CS.S6",
  title: "Рефлексия",
  order: 6,
  prereqs: ["CS.S1"],
  lessons: [
    entry(
      { id: "CS.S6.reflection-overview", track: "CS", section: "CS.S6", title: "Reflection: обзор и граф метаданных", kicker: "C# вглубь · S6 · самоописание рантайма", icon: "types", subtitle: "System.Reflection, граф assembly→member, RuntimeType", estMinutes: 9, cards: 3 },
      () => import("./cs/reflection-overview.ts").then((m) => m.reflectionOverview),
    ),
    entry(
      { id: "CS.S6.type-metadata", track: "CS", section: "CS.S6", title: "Type и метаданные членов", kicker: "C# вглубь · S6 · запрос к метаданным", icon: "types", subtitle: "Type-свойства, MemberInfo, MemberType, BindingFlags-фильтр", estMinutes: 10, cards: 3 },
      () => import("./cs/type-metadata.ts").then((m) => m.typeMetadata),
    ),
    entry(
      { id: "CS.S6.dynamic-loading", track: "CS", section: "CS.S6", title: "Динамическая загрузка и late binding", kicker: "C# вглубь · S6 · связывание в рантайме", icon: "types", subtitle: "early vs late binding, InvokeMember, Binder, ChangeType", estMinutes: 10, cards: 3 },
      () => import("./cs/dynamic-loading.ts").then((m) => m.dynamicLoading),
    ),
    entry(
      { id: "CS.S6.attributes", track: "CS", section: "CS.S6", title: "Атрибуты: создание и чтение", kicker: "C# вглубь · S6 · метаданные на декларации", icon: "types", subtitle: "custom attribute, AttributeUsage, positional/named, GetCustomAttribute", estMinutes: 10, cards: 3 },
      () => import("./cs/attributes.ts").then((m) => m.attributes),
    ),
    entry(
      { id: "CS.S6.reflection-emit", track: "CS", section: "CS.S6", title: "Reflection.Emit: генерация IL в рантайме", kicker: "C# вглубь · S6 · reflection, которая пишет код", icon: "types", subtitle: "System.Reflection.Emit, DynamicMethod, ILGenerator, CreateDelegate", estMinutes: 11, cards: 3 },
      () => import("./cs/reflection-emit.ts").then((m) => m.reflectionEmit),
    ),
    entry(
      { id: "CS.S6.reflection-generics", track: "CS", section: "CS.S6", title: "Reflection и generics: открытые и закрытые типы", kicker: "C# вглубь · S6 · параметры vs аргументы", icon: "types", subtitle: "открытый/закрытый, MakeGenericType, GetGenericArguments, IsGenericParameter", estMinutes: 10, cards: 3 },
      () => import("./cs/reflection-generics.ts").then((m) => m.reflectionGenerics),
    ),
    entry(
      { id: "CS.S6.source-generators", track: "CS", section: "CS.S6", title: "Source generators: compile-time вместо reflection", kicker: "C# вглубь · S6 · метапрограммирование на компиляции", icon: "types", subtitle: "compile-time metaprogramming, additive-only, reflection vs generated", estMinutes: 10, cards: 3 },
      () => import("./cs/source-generators.ts").then((m) => m.sourceGenerators),
    ),
  ],
};

// Section S8 «Threading и синхронизация» (RS-03 §2 раздел 8 · 9 уроков). Prereq CS.S2 (async) + CS.S1.
const CS_S8: Section = {
  id: "CS.S8",
  title: "Threading и синхронизация",
  order: 8,
  prereqs: ["CS.S2"],
  lessons: [
    entry(
      { id: "CS.S8.managed-threading-basics", track: "CS", section: "CS.S8", title: "Managed threading: что даёт CLR", kicker: "C# вглубь · S8 · поток как единица планирования", icon: "async", subtitle: "Thread над ОС-потоком, общая память, гонки, примитивы", estMinutes: 9, cards: 3 },
      () => import("./cs/managed-threading-basics.ts").then((m) => m.managedThreadingBasics),
    ),
    entry(
      { id: "CS.S8.threads-and-threading", track: "CS", section: "CS.S8", title: "Thread, foreground/background, ThreadPool", kicker: "C# вглубь · S8 · три уровня запуска", icon: "async", subtitle: "primary/worker, TPL→ThreadPool→Thread, fg/bg, пул", estMinutes: 10, cards: 3 },
      () => import("./cs/threads-and-threading.ts").then((m) => m.threadsAndThreading),
    ),
    entry(
      { id: "CS.S8.lock-statement", track: "CS", section: "CS.S8", title: "lock и System.Threading.Lock (.NET 9+)", kicker: "C# вглубь · S8 · взаимное исключение", icon: "async", subtitle: "lock → Monitor/EnterScope, реентерабельность, что не лочить", estMinutes: 10, cards: 3 },
      () => import("./cs/lock-statement.ts").then((m) => m.lockStatement),
    ),
    entry(
      { id: "CS.S8.sync-primitives-overview", track: "CS", section: "CS.S8", title: "Обзор примитивов синхронизации", kicker: "C# вглубь · S8 · карта примитивов", icon: "async", subtitle: "WaitHandle vs lightweight, доступ к ресурсу, сигналинг", estMinutes: 10, cards: 3 },
      () => import("./cs/sync-primitives-overview.ts").then((m) => m.syncPrimitivesOverview),
    ),
    entry(
      { id: "CS.S8.threading-objects", track: "CS", section: "CS.S8", title: "Mutex / Semaphore(Slim) / EventWaitHandle", kicker: "C# вглубь · S8 · три WaitHandle-объекта", icon: "async", subtitle: "Mutex (affinity), Semaphore (N), EventWaitHandle (сигнал)", estMinutes: 10, cards: 3 },
      () => import("./cs/threading-objects.ts").then((m) => m.threadingObjects),
    ),
    entry(
      { id: "CS.S8.volatile-memory-model", track: "CS", section: "CS.S8", title: "Volatile, модель памяти, reordering", kicker: "C# вглубь · S8 · барьеры памяти", icon: "async", subtitle: "reordering, Volatile.Read/Write, барьеры, публикация", estMinutes: 10, cards: 3 },
      () => import("./cs/volatile-memory-model.ts").then((m) => m.volatileMemoryModel),
    ),
    entry(
      { id: "CS.S8.interlocked", track: "CS", section: "CS.S8", title: "Interlocked: lock-free инкремент и CAS", kicker: "C# вглубь · S8 · атомарные операции", icon: "async", subtitle: "атомарный ++, Exchange, CompareExchange (CAS)", estMinutes: 10, cards: 3 },
      () => import("./cs/interlocked.ts").then((m) => m.interlocked),
    ),
    entry(
      { id: "CS.S8.tpl-parallel", track: "CS", section: "CS.S8", title: "TPL: Parallel.For/ForEach и degree of parallelism", kicker: "C# вглубь · S8 · data parallelism", icon: "async", subtitle: "Parallel.For/ForEach, партиции, MaxDegreeOfParallelism, overhead", estMinutes: 10, cards: 3 },
      () => import("./cs/tpl-parallel.ts").then((m) => m.tplParallel),
    ),
    entry(
      { id: "CS.S8.thread-async-local", track: "CS", section: "CS.S8", title: "ThreadLocal<T> / AsyncLocal<T>: контекст в async", kicker: "C# вглубь · S8 · амбиентное состояние", icon: "async", subtitle: "per-thread vs per-async-flow, фабрика, поток управления", estMinutes: 10, cards: 3 },
      () => import("./cs/thread-async-local.ts").then((m) => m.threadAsyncLocal),
    ),
  ],
};

// Section S9 «Исключения» (RS-03 §2 раздел 9 · 7 уроков). Prereq CS.S2 + CS.S1. A DEDICATED,
// deeper synchronous exception treatment that complements CS.S2.exceptions (async-only: await
// vs .Wait, WhenAll, Flatten) — zero overlap: S9 covers the exception object/unwinding, filters,
// throw-vs-rethrow, custom exceptions, best practices, and AggregateException/TPL.
const CS_S9: Section = {
  id: "CS.S9",
  title: "Исключения",
  order: 9,
  prereqs: ["CS.S2"],
  lessons: [
    entry(
      { id: "CS.S9.exceptions-overview", track: "CS", section: "CS.S9", title: "Исключения: объект, раскрутка стека, first-chance", kicker: "C# вглубь · S9 · модель исключения", icon: "types", subtitle: "Объект : System.Exception, раскрутка вверх, first-chance", estMinutes: 9, cards: 3 },
      () => import("./cs/exceptions-overview.ts").then((m) => m.exceptionsOverview),
    ),
    entry(
      { id: "CS.S9.try-catch-finally", track: "CS", section: "CS.S9", title: "try / catch / finally: формы и гарантии", kicker: "C# вглубь · S9 · операторы обработки", icon: "types", subtitle: "три формы try, порядок catch, гарантия finally", estMinutes: 10, cards: 3 },
      () => import("./cs/try-catch-finally.ts").then((m) => m.tryCatchFinally),
    ),
    entry(
      { id: "CS.S9.exception-filters", track: "CS", section: "CS.S9", title: "Фильтры исключений: when без раскрутки стека", kicker: "C# вглубь · S9 · when-фильтр", icon: "types", subtitle: "when (bool), оценка до раскрутки, false → поиск дальше", estMinutes: 10, cards: 3 },
      () => import("./cs/exception-filters.ts").then((m) => m.exceptionFilters),
    ),
    entry(
      { id: "CS.S9.throw-vs-rethrow", track: "CS", section: "CS.S9", title: "throw; vs throw ex; — сохранение стека", kicker: "C# вглубь · S9 · переброс исключения", icon: "types", subtitle: "throw; сохраняет стек, throw e; сбрасывает, обёртка через inner", estMinutes: 10, cards: 3 },
      () => import("./cs/throw-vs-rethrow.ts").then((m) => m.throwVsRethrow),
    ),
    entry(
      { id: "CS.S9.custom-exceptions", track: "CS", section: "CS.S9", title: "Пользовательские исключения: свой класс : Exception", kicker: "C# вглубь · S9 · свой тип исключения", icon: "types", subtitle: "derive from Exception, три конструктора, когда бросать, wrap", estMinutes: 10, cards: 3 },
      () => import("./cs/custom-exceptions.ts").then((m) => m.customExceptions),
    ),
    entry(
      { id: "CS.S9.exception-best-practices", track: "CS", section: "CS.S9", title: "Практики исключений: что бросать и ловить", kicker: "C# вглубь · S9 · дисциплина ошибок", icon: "types", subtitle: "что ловить, Try* вместо throw, восстановление состояния, builder-хелперы", estMinutes: 10, cards: 3 },
      () => import("./cs/exception-best-practices.ts").then((m) => m.exceptionBestPractices),
    ),
    entry(
      { id: "CS.S9.aggregate-exception", track: "CS", section: "CS.S9", title: "AggregateException: Flatten, Handle, TPL", kicker: "C# вглубь · S9 · агрегат ошибок", icon: "async", subtitle: "consolidate в один объект, .Wait оборачивает, Flatten, Handle", estMinutes: 10, cards: 3 },
      () => import("./cs/aggregate-exception.ts").then((m) => m.aggregateException),
    ),
  ],
};

// Section S10 «Generics вглубь» (RS-03 §2 раздел 10 · 8 уроков). Prereq CS.S1. A DEDICATED,
// deeper generics treatment that complements CS.S1.generics-basics (compile-time mechanics,
// open/closed, where, the boxing headline), CS.S4.delegate-variance (variance of DELEGATES) and
// CS.S6.reflection-generics (open/closed types via reflection) — zero overlap: S10 covers the
// runtime representation (reification, specialization), the FULL constraint vocabulary, default(T),
// variance of INTERFACES, generic-method type inference, per-closed-type statics, boxing-removal
// measured, and generic math (static abstract members, INumber<T>).
const CS_S10: Section = {
  id: "CS.S10",
  title: "Generics вглубь",
  order: 10,
  prereqs: ["CS.S1"],
  lessons: [
    entry(
      { id: "CS.S10.generics-runtime", track: "CS", section: "CS.S10", title: "Generics в рантайме: специализация и код-шаринг", kicker: "C# вглубь · S10 · представление в рантайме", icon: "types", subtitle: "Реификация, ref-код-шаринг, специализация value-типов, замер", estMinutes: 10, cards: 3 },
      () => import("./cs/generics-runtime.ts").then((m) => m.genericsRuntime),
    ),
    entry(
      { id: "CS.S10.constraints", track: "CS", section: "CS.S10", title: "where-ограничения: полный словарь", kicker: "C# вглубь · S10 · гейты типа", icon: "types", subtitle: "class/struct/notnull/unmanaged/new()/база/интерфейс/T:U/default/allows ref struct", estMinutes: 11, cards: 3 },
      () => import("./cs/constraints.ts").then((m) => m.constraints),
    ),
    entry(
      { id: "CS.S10.default-keyword", track: "CS", section: "CS.S10", title: "default(T) и default-литерал для параметра типа", kicker: "C# вглубь · S10 · нейтральное значение T", icon: "types", subtitle: "default(T): null для ref, ноль по полям для value; default-литерал", estMinutes: 9, cards: 3 },
      () => import("./cs/default-keyword.ts").then((m) => m.defaultKeyword),
    ),
    entry(
      { id: "CS.S10.interface-variance", track: "CS", section: "CS.S10", title: "Ковариантность интерфейсов: out T / in T", kicker: "C# вглубь · S10 · вариантность интерфейсов", icon: "types", subtitle: "out T (IEnumerable<out T>), in T (IComparer<in T>), инвариантность по умолчанию", estMinutes: 10, cards: 3 },
      () => import("./cs/interface-variance.ts").then((m) => m.interfaceVariance),
    ),
    entry(
      { id: "CS.S10.generic-methods", track: "CS", section: "CS.S10", title: "Generic-методы и вывод типов", kicker: "C# вглубь · S10 · type inference", icon: "types", subtitle: "свой <T>, вывод из аргументов, границы вывода, overload-резолв", estMinutes: 9, cards: 3 },
      () => import("./cs/generic-methods.ts").then((m) => m.genericMethods),
    ),
    entry(
      { id: "CS.S10.generic-static-members", track: "CS", section: "CS.S10", title: "Статика в generic-типе: своя на каждый закрытый тип", kicker: "C# вглубь · S10 · static per closed type", icon: "types", subtitle: "Counter<int> ≠ Counter<string>, static ctor per closed type, замер", estMinutes: 9, cards: 3 },
      () => import("./cs/generic-static-members.ts").then((m) => m.genericStaticMembers),
    ),
    entry(
      { id: "CS.S10.boxing-and-generics", track: "CS", section: "CS.S10", title: "Generics убирают боксинг: List<int> vs ArrayList", kicker: "C# вглубь · S10 · цена боксинга", icon: "gc", subtitle: "почему ArrayList боксит, цена бокса (24 B), List<int> inline, замер", estMinutes: 9, cards: 3 },
      () => import("./cs/boxing-and-generics.ts").then((m) => m.boxingAndGenerics),
    ),
    entry(
      { id: "CS.S10.generic-math", track: "CS", section: "CS.S10", title: "Generic math: static abstract члены и INumber<T>", kicker: "C# вглубь · S10 · static abstract (C# 11)", icon: "types", subtitle: "static abstract/virtual в интерфейсе, INumber<T>, один generic на все числа", estMinutes: 11, cards: 3 },
      () => import("./cs/generic-math.ts").then((m) => m.genericMath),
    ),
  ],
};

// Section S11 «Deep dive into expression trees» (RS-03 §2 · 6 lessons). Prereq CS.S3 (LINQ) + CS.S1.
// Goes DEEPER than CS.S3.ienumerable-iqueryable (which named the delegate-vs-tree split): here the
// tree ITSELF is the subject — code-as-data, programmatic building, Compile() to a delegate,
// ExpressionVisitor traversal/transformation, DebugView inspection, and how IQueryable providers
// translate the tree (EF Core -> SQL). Read CS.S3.ienumerable-iqueryable first; zero duplication.
const CS_S11: Section = {
  id: "CS.S11",
  title: "Деревья выражений",
  order: 11,
  prereqs: ["CS.S3"],
  lessons: [
    entry(
      { id: "CS.S11.expression-trees-overview", track: "CS", section: "CS.S11", title: "Деревья выражений: код как данные", kicker: "C# вглубь · S11 · code as data", icon: "types", subtitle: "Expression<Func<>> vs Func<>, узел = выражение, зачем провайдерам", estMinutes: 9, cards: 3 },
      () => import("./cs/expression-trees-overview.ts").then((m) => m.expressionTreesOverview),
    ),
    entry(
      { id: "CS.S11.building-expressions", track: "CS", section: "CS.S11", title: "Программное построение деревьев", kicker: "C# вглубь · S11 · снизу вверх", icon: "types", subtitle: "Expression.Parameter/Constant/Add/Lambda, неизменяемость, от листьев к корню", estMinutes: 10, cards: 3 },
      () => import("./cs/building-expressions.ts").then((m) => m.buildingExpressions),
    ),
    entry(
      { id: "CS.S11.compiling-expressions", track: "CS", section: "CS.S11", title: "Компиляция и исполнение деревьев", kicker: "C# вглубь · S11 · дерево → делегат", icon: "types", subtitle: "LambdaExpression.Compile() → делегат, invoke vs DynamicInvoke, что исполнимо", estMinutes: 9, cards: 3 },
      () => import("./cs/compiling-expressions.ts").then((m) => m.compilingExpressions),
    ),
  ],
};

const CS_TRACK: Track = {
  id: "CS",
  title: S.trackCsDeepLabel,
  sub: S.trackCsDeepSub,
  badge: S.trackNewBadge,
  sections: [CS_S1, CS_S2, CS_S3, CS_S5, CS_S7, CS_S8, CS_S9, CS_S10, CS_S11, CS_S17, CS_S18, CS_S4, CS_S6],
};

// The legacy flat C# track and its 6 old lessons were removed in the F2 migration (their
// files + seeds deleted, orphan review rows purged). Every topic is re-covered by the new
// sectioned CS track (RS-03 anti-regression matrix). Only CS and PY groups remain.

// Python track (flat) — untouched (G5).
const PY_TRACK: Track = {
  id: "PY",
  title: S.trackPythonLabel,
  sub: S.trackPythonSub,
  badge: S.trackNewBadge,
  sections: [
    {
      id: "PY",
      title: S.trackPythonLabel,
      order: 50,
      prereqs: [],
      lessons: [
        entry({ id: "PY.M1.names-objects", track: "PY", section: "PY", title: "Имена и объекты", kicker: "Python · модель", icon: "types", subtitle: "Ссылки, идентичность, дескрипторы", estMinutes: 8, cards: 1, lang: "python" }, () => import("./py-names-objects.ts").then((m) => m.pyNamesObjects)),
        entry({ id: "PY.M2.collections-hash", track: "PY", section: "PY", title: "Коллекции и хеш", kicker: "Python · коллекции", icon: "collections", subtitle: "dict, set, хеш-таблица", estMinutes: 8, cards: 1, lang: "python" }, () => import("./py-collections-hash.ts").then((m) => m.pyCollectionsHash)),
        entry({ id: "PY.M3.args-unpacking", track: "PY", section: "PY", title: "Аргументы и распаковка", kicker: "Python · функции", icon: "types", subtitle: "*args, **kwargs, распаковка", estMinutes: 7, cards: 1, lang: "python" }, () => import("./py-args-unpacking.ts").then((m) => m.pyArgsUnpacking)),
        entry({ id: "PY.M4.closures-scope", track: "PY", section: "PY", title: "Замыкания и области", kicker: "Python · замыкания", icon: "types", subtitle: "LEGB, cell, nonlocal", estMinutes: 8, cards: 1, lang: "python" }, () => import("./py-closures-scope.ts").then((m) => m.pyClosuresScope)),
        entry({ id: "PY.M5.decorators", track: "PY", section: "PY", title: "Декораторы", kicker: "Python · декораторы", icon: "types", subtitle: "wraps, параметры, стек", estMinutes: 9, cards: 1, lang: "python" }, () => import("./py-decorators.ts").then((m) => m.pyDecorators)),
        entry({ id: "PY.M6.generators", track: "PY", section: "PY", title: "yield: пауза, а не return", kicker: "Python · генераторы · механизм", icon: "async", subtitle: "Кадр gi_frame, yield-фикстуры", estMinutes: 8, cards: 4, lang: "python" }, () => import("./py-generators.ts").then((m) => m.pyGenerators)),
        entry({ id: "PY.M7.context-managers", track: "PY", section: "PY", title: "Контекстные менеджеры", kicker: "Python · with", icon: "types", subtitle: "__enter__/__exit__, contextlib", estMinutes: 8, cards: 1, lang: "python" }, () => import("./py-context-managers.ts").then((m) => m.pyContextManagers)),
        entry({ id: "PY.M8.object-model", track: "PY", section: "PY", title: "Объектная модель", kicker: "Python · объекты", icon: "types", subtitle: "MRO, dunder, слоты", estMinutes: 9, cards: 1, lang: "python" }, () => import("./py-object-model.ts").then((m) => m.pyObjectModel)),
        entry({ id: "PY.M9.exceptions", track: "PY", section: "PY", title: "Исключения", kicker: "Python · исключения", icon: "types", subtitle: "Иерархия, chaining, группы", estMinutes: 8, cards: 1, lang: "python" }, () => import("./py-exceptions.ts").then((m) => m.pyExceptions)),
        entry({ id: "PY.M10.type-hints", track: "PY", section: "PY", title: "Аннотации типов", kicker: "Python · типы", icon: "types", subtitle: "typing, Protocol, generics", estMinutes: 7, cards: 1, lang: "python" }, () => import("./py-type-hints.ts").then((m) => m.pyTypeHints)),
        entry({ id: "PY.M11.async-await", track: "PY", section: "PY", title: "async/await в Python", kicker: "Python · async", icon: "async", subtitle: "event loop, корутины, задачи", estMinutes: 9, cards: 1, lang: "python" }, () => import("./py-async-await.ts").then((m) => m.pyAsyncAwait)),
        entry({ id: "PY.M12.strings-flow", track: "PY", section: "PY", title: "Строки и поток", kicker: "Python · строки", icon: "types", subtitle: "Иммутабельность, f-strings", estMinutes: 6, cards: 1, lang: "python" }, () => import("./py-strings-flow.ts").then((m) => m.pyStringsFlow)),
        entry({ id: "PY.M13.stdlib-idioms", track: "PY", section: "PY", title: "Идиомы stdlib", kicker: "Python · stdlib", icon: "types", subtitle: "itertools, functools, collections", estMinutes: 7, cards: 1, lang: "python" }, () => import("./py-stdlib-idioms.ts").then((m) => m.pyStdlibIdioms)),
      ],
    },
  ],
};

/** All tracks, in home render order. */
export const TRACKS: Track[] = [CS_TRACK, PY_TRACK];

// ---------------------------------------------------------------------------
// Flat views over the registry (used by home / progress / the runner).
// ---------------------------------------------------------------------------

/** Every lesson manifest entry, in curriculum order (CS sections, then legacy, then PY). */
export const MANIFEST: LessonManifestEntry[] = TRACKS.flatMap((t) => t.sections)
  .sort((a, b) => a.order - b.order)
  .flatMap((s) => s.lessons);

const ENTRY_BY_ID = new Map<string, LessonManifestEntry>(MANIFEST.map((e) => [e.id, e]));

/** Manifest entry for an id, or undefined. */
export function getEntry(id: string): LessonManifestEntry | undefined {
  return ENTRY_BY_ID.get(id);
}

/** True if the id is a registered lesson. */
export function hasEntry(id: string): boolean {
  return ENTRY_BY_ID.has(id);
}

/** Load (and cache) a lesson body by id. Rejects for an unknown id. */
export function loadBody(id: string): Promise<LessonData> {
  const e = ENTRY_BY_ID.get(id);
  if (!e) return Promise.reject(new Error(`Unknown lesson id: ${id}`));
  return e.load();
}

/** Synchronously return an already-loaded body (post-prefetch), or undefined. */
export function getLoadedBody(id: string): LessonData | undefined {
  return BODY_CACHE.get(id);
}

/** Every section across all tracks (flattened once, for section-scoped lookups). */
const ALL_SECTIONS: Section[] = TRACKS.flatMap((t) => t.sections);
const SECTION_BY_ID = new Map<string, Section>(ALL_SECTIONS.map((s) => [s.id, s]));

/**
 * Warm the body cache for one SECTION's lessons in the background (ADR-0005: section-scoped,
 * not eager-all). Called at boot for the first-session section so its entry is instant, while
 * the rest of the corpus loads on demand when opened — the trigger stays constant with corpus
 * size instead of scaling linearly (the whole point of the lazy-chunk split, ADR-0003).
 * Unknown / empty section id → no-op. Failures are swallowed (a lesson that fails to prefetch
 * is simply loaded on demand). Returns a promise that settles when the section has settled.
 */
export function prefetchSection(sectionId: string): Promise<void> {
  const s = SECTION_BY_ID.get(sectionId);
  if (!s) return Promise.resolve();
  return Promise.allSettled(s.lessons.map((e) => e.load())).then(() => undefined);
}

/**
 * The section that opens the first session: the lowest-`order` section across all tracks
 * (design «Опыт»: the CS track's S1, order 1, is entered first). Returns undefined only if
 * there are no sections at all.
 */
export function firstSectionId(): string | undefined {
  let best: Section | undefined;
  for (const s of ALL_SECTIONS) if (!best || s.order < best.order) best = s;
  return best?.id;
}

/** Ids of the lessons that belong to a section (empty for an unknown id). */
export function sectionLessonIds(sectionId: string): string[] {
  return SECTION_BY_ID.get(sectionId)?.lessons.map((e) => e.id) ?? [];
}

const TRACK_BY_ID = new Map<string, Track>(TRACKS.map((t) => [t.id, t]));

/** The track object for an id (undefined if unknown). */
export function getTrack(id: string): Track | undefined {
  return TRACK_BY_ID.get(id);
}

/**
 * A track's sections in RECOMMENDED order (F4 «дальше»-цепочка): a stable topological sort by
 * `Section.prereqs` (a section comes after all of its prereqs), with `Section.order` as the
 * deterministic tie-break. This is the SOFT recommendation order (design «Опыт»: S1 → S7 → S17
 * → S18 → S2 for CS) — there is no hard lock in wave 1, so a learner may open any section; this
 * only drives which lesson the "продолжить" hint points at. Cycles/dangling prereqs degrade
 * gracefully to `order` (a prereq not in this track is ignored).
 */
export function sectionsInPrereqOrder(trackId: string): Section[] {
  const track = TRACK_BY_ID.get(trackId);
  if (!track) return [];
  const sections = [...track.sections].sort((a, b) => a.order - b.order);
  const byId = new Map(sections.map((s) => [s.id, s]));
  const out: Section[] = [];
  const done = new Set<string>();
  const visiting = new Set<string>();
  const visit = (s: Section): void => {
    if (done.has(s.id) || visiting.has(s.id)) return; // done or a cycle back-edge → stop
    visiting.add(s.id);
    for (const p of s.prereqs) {
      const dep = byId.get(p); // ignore prereqs pointing outside this track
      if (dep) visit(dep);
    }
    visiting.delete(s.id);
    done.add(s.id);
    out.push(s);
  };
  for (const s of sections) visit(s); // iterate in `order` so ties resolve deterministically
  return out;
}
