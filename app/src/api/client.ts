/**
 * Typed client for the Codex backend (auth / due / review / lessons).
 * Base URL is configurable via VITE_API_BASE; defaults to the local dev server.
 * The backend is the durable source of truth for the FSRS schedule (SQLite),
 * so `review` really moves the schedule server-side (not a display-only tick).
 */
import type { AuthResponse, DueResponse, Grade, LessonSummary, ReviewResponse, StatsResponse } from "./types.ts";

const BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:5080";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE + path, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch (e) {
    throw new ApiError(`network: ${(e as Error).message}`, 0);
  }
  if (!res.ok) {
    let detail = "";
    try {
      detail = JSON.stringify(await res.json());
    } catch {
      /* ignore */
    }
    throw new ApiError(`${path} -> ${res.status} ${detail}`, res.status);
  }
  return (await res.json()) as T;
}

export const api = {
  base: BASE,

  /** Telegram path: pass initData. Dev path: pass a stable devUserId. */
  auth(body: { initData: string } | { devUserId: number }): Promise<AuthResponse> {
    return req<AuthResponse>("/api/auth", { method: "POST", body: JSON.stringify(body) });
  },

  due(userId: number): Promise<DueResponse> {
    return req<DueResponse>(`/api/due?userId=${encodeURIComponent(userId)}`);
  },

  stats(userId: number): Promise<StatsResponse> {
    return req<StatsResponse>(`/api/stats?userId=${encodeURIComponent(userId)}`);
  },

  review(userId: number, itemId: string, grade: Grade): Promise<ReviewResponse> {
    return req<ReviewResponse>("/api/review", {
      method: "POST",
      body: JSON.stringify({ userId, itemId, grade }),
    });
  },

  lessons(): Promise<LessonSummary[]> {
    return req<LessonSummary[]>("/api/lessons");
  },
};
