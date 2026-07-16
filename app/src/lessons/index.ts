/**
 * Lesson registry — the ONE place you touch to add a lesson.
 *
 * To add a lesson:
 *   1. create src/lessons/<slug>.ts exporting a `LessonData` object;
 *   2. add a matching backend seed (backend/Codex.Backend/seed/lessons/<id>.json)
 *      with the same `id` and card ids, so its cards enter the FSRS due queue;
 *   3. import it here and append to `LESSONS` (curriculum order).
 * Nothing in the UI is hardcoded per lesson — the LessonRunner renders any
 * LessonData through the shared engine. Lessons are BUNDLED (not fetched) so a
 * session survives offline (RS-15: no service worker in iOS WebView).
 *
 * See docs/AUTHORING-AI.md for the full playbook.
 */
import type { LessonData } from "./types.ts";
import { valueVsReference } from "./value-vs-reference.ts";
import { boxing } from "./boxing.ts";
import { gc } from "./gc.ts";
import { closures } from "./closures.ts";
import { asyncAwait } from "./async-await.ts";
import { hashtable } from "./hashtable.ts";
import { pyNamesObjects } from "./py-names-objects.ts";
import { pyCollectionsHash } from "./py-collections-hash.ts";
import { pyArgsUnpacking } from "./py-args-unpacking.ts";
import { pyClosuresScope } from "./py-closures-scope.ts";
import { pyDecorators } from "./py-decorators.ts";
import { pyGenerators } from "./py-generators.ts";
import { pyContextManagers } from "./py-context-managers.ts";
import { S } from "../strings.ts";

/** Ordered by the concept DAG (prereqs first). */
export const LESSONS: LessonData[] = [
  valueVsReference,
  boxing,
  gc,
  closures,
  asyncAwait,
  hashtable,
  pyNamesObjects,
  pyCollectionsHash,
  pyArgsUnpacking,
  pyClosuresScope,
  pyDecorators,
  pyGenerators,
  pyContextManagers,
];

/**
 * Track groups — the home path renders one SECTION per group (generic: any future
 * track lands here with a registry line, no per-track UI code). `tracks` lists the
 * lesson `track` ids belonging to the group; labels live in strings.ts (UI language).
 */
export interface TrackGroup {
  id: string;
  label: string;
  /** Optional one-line section subtitle (rendered under the label). */
  sub?: string;
  /** Optional badge next to the label (e.g. «новый трек»). */
  badge?: string;
  tracks: string[];
}

export const TRACK_GROUPS: TrackGroup[] = [
  { id: "csharp", label: S.trackCsharpLabel, tracks: ["T1", "T2"] },
  { id: "python", label: S.trackPythonLabel, sub: S.trackPythonSub, badge: S.trackNewBadge, tracks: ["PY"] },
];

const BY_ID = new Map<string, LessonData>(LESSONS.map((l) => [l.id, l]));

export function getLesson(id: string): LessonData | undefined {
  return BY_ID.get(id);
}

export function hasLesson(id: string): boolean {
  return BY_ID.has(id);
}

export type { LessonData } from "./types.ts";
