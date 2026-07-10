/** DTOs mirroring the backend contract (backend/README.md, verified via curl). */

export interface AuthResponse {
  userId: number;
  created: string;
  mode: "dev" | "telegram";
}

/** One entry of GET /api/due (backend DueItem). */
export interface DueItem {
  itemId: string; // `${lessonId}/${cardId}`
  prompt: string | null;
  isNew: boolean;
  stability: number | null;
  difficulty: number | null;
  due: string | null;
  reps: number;
  lastReview: string | null;
}

export interface DueResponse {
  userId: number;
  now: string;
  count: number;
  items: DueItem[];
}

export interface ReviewResponse {
  itemId: string;
  grade: string; // "Again" | "Hard" | "Good" | "Easy"
  difficulty: number;
  stability: number;
  intervalDays: number;
  elapsedDays: number;
  due: string;
  reps: number;
  lapses: number;
}

/** Durable, server-derived home stats (GET /api/stats). */
export interface StatsResponse {
  userId: number;
  reviewsTotal: number;
  streakDays: number;
  xp: number;
}

/** Review-count breakdown by FSRS grade (GET /api/progress). */
export interface GradeMix {
  again: number;
  hard: number;
  good: number;
  easy: number;
}

/** Catalog-wide card coverage for a user. */
export interface CardsSummary {
  seen: number; // distinct items the user has a review_state for
  total: number; // items in the whole catalog
  mastered: number; // stability >= masteryStabilityDays
  lapsesTotal: number; // sum of lapses across all this user's cards
}

/** Per-lesson row: card mastery AND lesson-viewing progress (deliberately distinct). */
export interface LessonProgress {
  lessonId: string;
  seen: number; // cards with FSRS review_state
  total: number; // cards in the lesson
  mastered: number; // cards with stability >= masteryStabilityDays
  due: number; // due now (due <= now) or never seen
  segmentsSeen: number; // lesson segments the user has viewed (monotonic)
  segmentsTotal: number; // total segments in the lesson (last reported)
  completed: boolean; // whole lesson viewed at least once (sticky)
}

/** A single (day, count) bucket for the activity heatmap / upcoming timeline. */
export interface DayCount {
  day: string; // "yyyy-MM-dd" (UTC)
  count: number;
}

/** Full, server-derived progress dashboard (GET /api/progress). Every number is real. */
export interface ProgressResponse {
  userId: number;
  reviewsTotal: number;
  streakDays: number;
  xp: number;
  memberSince: string | null; // users.created, or null for an unknown user
  daysActive: number; // distinct UTC days with >=1 review
  masteryStabilityDays: number; // the mastery threshold (~90% retention at this interval)
  // lesson-viewing rollup — honest "how far through the material" (viewing != mastery)
  lessonsTotal: number; // distinct lessons in the catalog
  lessonsCompleted: number; // lessons fully viewed at least once
  lessonsStarted: number; // lessons with >=1 segment viewed
  segmentsViewed: number; // total segments viewed across all lessons
  gradeMix: GradeMix;
  cards: CardsSummary;
  perLesson: LessonProgress[];
  activity: DayCount[]; // last 28 days (heatmap), 0-filled
  upcoming: DayCount[]; // next 7 days (forward FSRS schedule), 0-filled
}

/** Result of POST /api/lesson-progress (echoes the stored, monotonic values). */
export interface LessonProgressResponse {
  ok: boolean;
  userId: number;
  lessonId: string;
  segmentsSeen: number;
  segmentsTotal: number;
  completed: boolean;
}

/** Result of DELETE /api/progress (reset). */
export interface ResetProgressResponse {
  ok: boolean;
  userId: number;
  reviewStatesDeleted: number;
  eventsDeleted: number;
}

export interface LessonSummary {
  id: string;
  title: string;
  track: string;
  module: string;
  status: string;
  cards: number; // number of reviewable items derived from the lesson
}

/** FSRS grade codes (backend: 1=Again, 2=Hard, 3=Good, 4=Easy). */
export type Grade = 1 | 2 | 3 | 4;
