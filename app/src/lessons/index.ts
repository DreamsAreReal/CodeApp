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

/** Ordered by the concept DAG (prereqs first). */
export const LESSONS: LessonData[] = [valueVsReference, boxing, gc, closures, asyncAwait, hashtable];

const BY_ID = new Map<string, LessonData>(LESSONS.map((l) => [l.id, l]));

export function getLesson(id: string): LessonData | undefined {
  return BY_ID.get(id);
}

export function hasLesson(id: string): boolean {
  return BY_ID.has(id);
}

export type { LessonData } from "./types.ts";
