/**
 * Lesson registry facade — the ONE place the app reads lessons from.
 *
 * Lessons are now LAZY (ADR-0003): the initial chunk holds only lightweight metadata
 * (`LessonMeta`, built from `registry.ts`), and each lesson BODY is a separate chunk
 * loaded on demand. Home / Progress render from `LESSONS` (metadata) without pulling a
 * single body; the runner loads the requested body via `loadLesson()` (or reads a
 * boot-prefetched one via `getLesson()`).
 *
 * To add a lesson:
 *   1. create src/lessons/<track>/<slug>.ts exporting a `LessonData` object;
 *   2. add a matching backend seed (backend/Codex.Backend/seed/lessons/<id>.json)
 *      with the same `id` and card ids, so its cards enter the FSRS due queue;
 *   3. register it in `registry.ts` under its track/section (a dynamic-import line).
 * See docs/AUTHORING-AI.md for the full playbook.
 */
import type { LessonData, LessonIcon } from "./types.ts";
import {
  MANIFEST,
  TRACKS,
  getEntry,
  hasEntry,
  loadBody,
  getLoadedBody,
  prefetchSection,
  firstSectionId,
  sectionLessonIds,
} from "./registry.ts";
import type { LessonManifestEntry, Section, Track } from "./registry.ts";
import { S } from "../strings.ts";

/**
 * Lightweight lesson metadata (initial chunk). Carries exactly what Home / Progress /
 * the track switcher need to render a lesson ROW without loading its (heavier) body:
 * id, track, section, title, the home-row fields, and the card count. Shaped so the
 * existing home/progress render code reads `lesson.home.icon`, `lesson.cards.length`,
 * `lesson.title`, `lesson.track` unchanged.
 */
export interface LessonMeta {
  id: string;
  track: string;
  section: string;
  title: string;
  kicker: string;
  home: { subtitle: string; icon: LessonIcon; estMinutes: number };
  /** A fixed-length array so `cards.length` is the real card count (no body needed). */
  cards: readonly unknown[];
}

function toMeta(e: LessonManifestEntry): LessonMeta {
  return {
    id: e.id,
    track: e.track,
    section: e.section,
    title: e.title,
    kicker: e.kicker,
    home: { subtitle: e.subtitle, icon: e.icon, estMinutes: e.estMinutes },
    cards: new Array(e.cards),
  };
}

/** Ordered lesson metadata (curriculum order) — the initial-chunk view for home/progress. */
export const LESSONS: LessonMeta[] = MANIFEST.map(toMeta);

const META_BY_ID = new Map<string, LessonMeta>(LESSONS.map((l) => [l.id, l]));

/** Metadata for an id (no body load). */
export function getLessonMeta(id: string): LessonMeta | undefined {
  return META_BY_ID.get(id);
}

/**
 * Synchronously return an ALREADY-LOADED lesson body (via boot prefetch or a prior open),
 * or undefined if its chunk has not resolved yet. The runner falls back to `loadLesson`.
 */
export function getLesson(id: string): LessonData | undefined {
  return getLoadedBody(id);
}

/** Load (and cache) a lesson body by id — awaits the lesson's chunk. Rejects for unknown ids. */
export function loadLesson(id: string): Promise<LessonData> {
  return loadBody(id);
}

/** True if the id is a registered lesson. */
export function hasLesson(id: string): boolean {
  return hasEntry(id);
}

/**
 * Section-scoped prefetch (ADR-0005): warm only ONE section's bodies at boot instead of the
 * whole catalog. `firstSectionId()` is the first-session section to warm; `prefetchSection`
 * warms a given section; `sectionLessonIds` lists a section's lesson ids.
 */
export { prefetchSection, firstSectionId, sectionLessonIds };
export { getEntry };
export type { LessonManifestEntry, Section, Track };
export { TRACKS };

/**
 * Home track groups — one home SECTION per group. Derived from the registry `TRACKS`
 * (generic: any future track lands here from its registry declaration, no per-track UI
 * code). `tracks` lists the lesson `track` ids belonging to the group; labels come from
 * the track declaration (UI language, strings.ts).
 */
export interface TrackGroup {
  id: string;
  label: string;
  sub?: string;
  badge?: string;
  tracks: string[];
}

/** Collect the distinct lesson-track ids that appear under a registry track. */
function trackIdsOf(t: Track): string[] {
  const ids = new Set<string>();
  for (const s of t.sections) for (const l of s.lessons) ids.add(l.track);
  return [...ids];
}

export const TRACK_GROUPS: TrackGroup[] = TRACKS.map((t) => ({
  id: t.id === "PY" ? "python" : t.id.toLowerCase(),
  label: t.title,
  sub: t.sub,
  badge: t.badge,
  tracks: trackIdsOf(t),
}));

// Keep the strings referenced (they now live in the registry track declarations).
void S;

export type { LessonData } from "./types.ts";
