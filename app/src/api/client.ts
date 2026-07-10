/**
 * Typed client for the Codex backend (auth / due / review / lessons).
 * Base URL is configurable via VITE_API_BASE; defaults to the local dev server.
 * The backend is the durable source of truth for the FSRS schedule (SQLite),
 * so `review` really moves the schedule server-side (not a display-only tick).
 *
 * AUTH: /api/auth returns a stateless signed session token. The client stores it and
 * sends it as `Authorization: Bearer <token>` on every request. userId is NEVER passed by
 * the client anymore — the server derives it from the token (the IDOR fix). On a 401 the
 * client transparently re-auths (with the credentials remembered from the last auth call)
 * and retries the request exactly once.
 */
import type {
  AuthResponse,
  DueResponse,
  Grade,
  LessonProgressResponse,
  LessonSummary,
  ProgressResponse,
  ResetProgressResponse,
  ReviewResponse,
  StatsResponse,
} from "./types.ts";

const BASE: string =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:5080";

/** Credentials remembered so the client can silently re-auth after a 401 (expired token). */
export type AuthCredentials = { initData: string } | { devUserId: number };

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Session token + the credentials that minted it, held in the module so `req` can re-auth.
let token: string | null = null;
let credentials: AuthCredentials | null = null;

async function rawAuth(body: AuthCredentials): Promise<AuthResponse> {
  let res: Response;
  try {
    res = await fetch(BASE + "/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
    throw new ApiError(`/api/auth -> ${res.status} ${detail}`, res.status);
  }
  return (await res.json()) as AuthResponse;
}

async function fetchOnce(path: string, init?: RequestInit): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init?.headers as Record<string, string>) ?? {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(BASE + path, { ...init, headers });
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetchOnce(path, init);
  } catch (e) {
    throw new ApiError(`network: ${(e as Error).message}`, 0);
  }

  // Transparent single retry on 401: the token expired/was rejected -> re-auth and retry once.
  if (res.status === 401 && credentials) {
    const refreshed = await rawAuth(credentials);
    token = refreshed.token;
    try {
      res = await fetchOnce(path, init);
    } catch (e) {
      throw new ApiError(`network: ${(e as Error).message}`, 0);
    }
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

  /**
   * Telegram path: pass initData. Dev path: pass a stable devUserId.
   * Stores the returned session token + the credentials (for silent 401 re-auth).
   */
  async auth(body: AuthCredentials): Promise<AuthResponse> {
    const res = await rawAuth(body);
    token = res.token;
    credentials = body;
    return res;
  },

  due(): Promise<DueResponse> {
    return req<DueResponse>("/api/due");
  },

  stats(): Promise<StatsResponse> {
    return req<StatsResponse>("/api/stats");
  },

  review(itemId: string, grade: Grade): Promise<ReviewResponse> {
    return req<ReviewResponse>("/api/review", {
      method: "POST",
      body: JSON.stringify({ itemId, grade }),
    });
  },

  /**
   * Report lesson-viewing progress (segments seen / completion). Fire-and-forget from
   * the UI: the server UPSERT is monotonic, so out-of-order/duplicate reports are safe.
   */
  reportLessonProgress(
    lessonId: string,
    segmentsSeen: number,
    segmentsTotal: number,
    completed: boolean,
  ): Promise<LessonProgressResponse> {
    return req<LessonProgressResponse>("/api/lesson-progress", {
      method: "POST",
      body: JSON.stringify({ lessonId, segmentsSeen, segmentsTotal, completed }),
    });
  },

  lessons(): Promise<LessonSummary[]> {
    return req<LessonSummary[]>("/api/lessons");
  },

  /** Full server-derived progress dashboard — real numbers only. */
  progress(): Promise<ProgressResponse> {
    return req<ProgressResponse>("/api/progress");
  },

  /** Erase THIS user's FSRS state + history (double-confirmed in the UI). */
  resetProgress(): Promise<ResetProgressResponse> {
    return req<ResetProgressResponse>("/api/progress", { method: "DELETE" });
  },
};
