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
