/**
 * Telegram WebApp integration + DEV FALLBACK.
 *
 * Inside Telegram: window.Telegram.WebApp exists — we call ready()/expand(),
 * match the native chrome to the cream surface, expose HapticFeedback, and
 * authenticate with the signed `initData` (validated server-side by HMAC).
 *
 * In a plain browser (local dev / headless): the bridge is absent, so we fall
 * back to a stable per-device `devUserId` (persisted in localStorage) and the
 * backend's dev-auth path — the whole loop works without a live bot.
 *
 * The mid design is LOCKED, so we intentionally do NOT recolour the app from
 * Telegram themeParams; we only tint Telegram's own header/background to blend.
 */

type HapticStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
type NotificationType = "success" | "warning" | "error";

interface HapticFeedback {
  impactOccurred(style: HapticStyle): void;
  notificationOccurred(type: NotificationType): void;
  selectionChanged(): void;
}
/** The Telegram-provided user profile (from initDataUnsafe; client-side identity only). */
export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}
interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: { user?: TelegramUser };
  colorScheme?: string;
  HapticFeedback?: HapticFeedback;
  ready(): void;
  expand(): void;
  setHeaderColor?(color: string): void;
  setBackgroundColor?(color: string): void;
}
declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

const CREAM = "#F6F1E9";
const DEV_KEY = "codex.devUserId";

function webApp(): TelegramWebApp | null {
  const w = window.Telegram?.WebApp;
  // A real Telegram context provides a non-empty initData string.
  return w && typeof w.initData === "string" && w.initData.length > 0 ? w : null;
}

function stableDevUserId(): number {
  const existing = localStorage.getItem(DEV_KEY);
  if (existing) {
    const n = Number(existing);
    if (Number.isFinite(n) && n > 0) return n;
  }
  const id = 100000 + Math.floor(Math.random() * 899999);
  localStorage.setItem(DEV_KEY, String(id));
  return id;
}

export type Credentials = { initData: string } | { devUserId: number };

export const tg = {
  get isTelegram(): boolean {
    return webApp() !== null;
  },

  /** Signal readiness + expand to full height; blend the native chrome. */
  ready(): void {
    const w = webApp();
    if (!w) return;
    try {
      w.ready();
      w.expand();
      w.setHeaderColor?.(CREAM);
      w.setBackgroundColor?.(CREAM);
    } catch {
      /* never let the bridge break boot */
    }
  },

  /** Credentials for POST /api/auth: real initData in Telegram, devUserId otherwise. */
  authCredentials(): Credentials {
    const w = webApp();
    if (w) return { initData: w.initData };
    return { devUserId: stableDevUserId() };
  },

  userLabel(): string | null {
    const u = webApp()?.initDataUnsafe?.user;
    return u ? u.first_name ?? u.username ?? String(u.id) : null;
  },

  /** The Telegram profile (name / username / photo), or null outside Telegram. */
  user(): TelegramUser | null {
    return webApp()?.initDataUnsafe?.user ?? null;
  },

  /** Haptic tap — no-op outside Telegram. */
  impact(style: HapticStyle = "light"): void {
    webApp()?.HapticFeedback?.impactOccurred(style);
  },
  notify(type: NotificationType): void {
    webApp()?.HapticFeedback?.notificationOccurred(type);
  },
};
