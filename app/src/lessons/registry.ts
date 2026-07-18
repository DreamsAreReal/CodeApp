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

const CS_TRACK: Track = {
  id: "CS",
  title: S.trackCsDeepLabel,
  sub: S.trackCsDeepSub,
  badge: S.trackNewBadge,
  sections: [CS_S1],
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
