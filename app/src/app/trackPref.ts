/**
 * Active track-group preference (client-side, persisted to localStorage — same
 * pattern as settings.ts). The home path shows ONE track group at a time; the
 * chip switcher writes the choice here, and OPENING a lesson also updates it to
 * that lesson's group — so "default on entry = the track of the last opened
 * lesson" emerges from one stored value with no priority conflicts.
 */
import { TRACK_GROUPS, getLesson } from "../lessons/index.ts";

const ACTIVE_GROUP_KEY = "codex.activeTrackGroup";

/** The persisted active group id, validated against the registry; falls back to the first group. */
export function activeGroupId(): string {
  try {
    const stored = localStorage.getItem(ACTIVE_GROUP_KEY);
    if (stored && TRACK_GROUPS.some((g) => g.id === stored)) return stored;
  } catch {
    /* storage unavailable — session default below */
  }
  return TRACK_GROUPS[0].id;
}

/** Persist an explicit switcher choice. */
export function setActiveGroup(id: string): void {
  if (!TRACK_GROUPS.some((g) => g.id === id)) return;
  try {
    localStorage.setItem(ACTIVE_GROUP_KEY, id);
  } catch {
    /* storage unavailable — the in-page render still switched */
  }
}

/** A lesson was opened: its track's group becomes the active one (last-opened wins). */
export function rememberLessonOpened(lessonId: string): void {
  const lesson = getLesson(lessonId);
  if (!lesson) return;
  const group = TRACK_GROUPS.find((g) => g.tracks.includes(lesson.track));
  if (group) setActiveGroup(group.id);
}
