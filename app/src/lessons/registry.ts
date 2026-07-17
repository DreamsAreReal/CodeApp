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
 *   - `prefetchAll()` (called at boot, non-blocking) warms the cache in the background;
 *     `getLoadedBody(id)` then returns the body SYNCHRONOUSLY for the runner. If a
 *     lesson is opened before its prefetch settled, `loadBody(id)` awaits the chunk.
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
// Legacy T1/T2 lessons stay live under the «Фундамент C#» flat group until F2
// migration retires them; Python PY.* lessons are a flat group (untouched, G5).
// Every `import()` is a self-contained chunk — Vite code-splits automatically.

const CS_S1: Section = {
  id: "CS.S1",
  title: "Типовая система",
  order: 1,
  prereqs: [],
  // Lessons are registered as their body files land (F1: value-types-copy; F6: type-system-map,
  // classes-virtual-dispatch). Kept as its own section so navigation groups them from day one.
  lessons: [
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
  ],
};

const CS_TRACK: Track = {
  id: "CS",
  title: S.trackCsDeepLabel,
  sub: S.trackCsDeepSub,
  badge: S.trackNewBadge,
  sections: [CS_S1],
};

// Legacy C# track (T1/T2) — kept as a single flat section until F2 migration.
const LEGACY_CS: Track = {
  id: "LEGACY_CS",
  title: S.trackCsharpLabel,
  sections: [
    {
      id: "T1",
      title: S.trackCsharpLabel,
      order: 90,
      prereqs: [],
      lessons: [
        entry(
          { id: "T1.M2.value-vs-reference", track: "T1", section: "T1", title: "Value vs reference", kicker: "Ядро C# · память", icon: "types", subtitle: "Копия значения против ссылки", estMinutes: 7, cards: 1 },
          () => import("./value-vs-reference.ts").then((m) => m.valueVsReference),
        ),
        entry(
          { id: "T1.M3.boxing", track: "T1", section: "T1", title: "Boxing и unboxing", kicker: "Ядро C# · память · нюанс", icon: "types", subtitle: "Упаковка, IL, куча и цена в цикле", estMinutes: 9, cards: 1 },
          () => import("./boxing.ts").then((m) => m.boxing),
        ),
        entry(
          { id: "T1.M4.gc", track: "T1", section: "T1", title: "Сборка мусора", kicker: "Ядро C# · GC", icon: "gc", subtitle: "Поколения, куча, продвижение, LOH", estMinutes: 9, cards: 1 },
          () => import("./gc.ts").then((m) => m.gc),
        ),
      ],
    },
    {
      id: "T2",
      title: S.trackCsharpLabel,
      order: 91,
      prereqs: [],
      lessons: [
        entry(
          { id: "T2.M1.async-await", track: "T2", section: "T2", title: "async/await", kicker: "Ядро C# · async", icon: "async", subtitle: "Стейт-машина, await, дедлок", estMinutes: 9, cards: 1 },
          () => import("./async-await.ts").then((m) => m.asyncAwait),
        ),
        entry(
          { id: "T2.M2.closures", track: "T2", section: "T2", title: "Замыкания", kicker: "Ядро C# · делегаты", icon: "types", subtitle: "Захват переменных, компиляторные классы", estMinutes: 8, cards: 1 },
          () => import("./closures.ts").then((m) => m.closures),
        ),
        entry(
          { id: "T2.M5.hashtable", track: "T2", section: "T2", title: "Hashtable и Dictionary", kicker: "Ядро C# · коллекции", icon: "collections", subtitle: "Бакеты, коллизии, resize", estMinutes: 9, cards: 1 },
          () => import("./hashtable.ts").then((m) => m.hashtable),
        ),
      ],
    },
  ],
};

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
export const TRACKS: Track[] = [CS_TRACK, LEGACY_CS, PY_TRACK];

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

/**
 * Warm the body cache for every lesson in the background (called at boot, non-blocking).
 * Each `load()` is an independent chunk fetch; failures are swallowed (a lesson that fails
 * to prefetch is simply loaded on demand when opened). Returns a promise that settles when
 * all prefetches have settled — harnesses/tests may await it for determinism.
 */
export function prefetchAll(): Promise<void> {
  return Promise.allSettled(MANIFEST.map((e) => e.load())).then(() => undefined);
}
