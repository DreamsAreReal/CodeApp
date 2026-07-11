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
 *
 * WEBVIEW CORRECTNESS (iOS): env(safe-area-inset-*) resolves to 0 inside the
 * Telegram iOS WebView (documented bug), and 100vh is unstable there. So on boot
 * we read Telegram's own contentSafeAreaInset / safeAreaInset and viewportStableHeight
 * and publish them as CSS custom properties on :root (--tg-content-safe-area-inset-*,
 * --tg-viewport-stable-height); the stylesheet consumes them with env()/dvh fallbacks
 * so a plain browser is unaffected. We subscribe to the matching change events to keep
 * them live. Every lifecycle call is guarded by isVersionAtLeast(...) — NOT a bare
 * try/catch — so we never invoke a method a given Telegram client is too old to expose.
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

/** A safe-area / content-safe-area inset quad as Telegram reports it (px numbers). */
interface SafeAreaInset {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/** Native BackButton controller (Telegram 6.1+). */
interface BackButton {
  show(): void;
  hide(): void;
  onClick(cb: () => void): void;
  offClick(cb: () => void): void;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: { user?: TelegramUser };
  version?: string;
  colorScheme?: string;
  themeParams?: Record<string, string>;
  viewportStableHeight?: number;
  contentSafeAreaInset?: SafeAreaInset;
  safeAreaInset?: SafeAreaInset;
  HapticFeedback?: HapticFeedback;
  BackButton?: BackButton;
  ready(): void;
  expand(): void;
  isVersionAtLeast?(version: string): boolean;
  onEvent?(event: string, handler: () => void): void;
  offEvent?(event: string, handler: () => void): void;
  setHeaderColor?(color: string): void;
  setBackgroundColor?(color: string): void;
  enableClosingConfirmation?(): void;
  disableClosingConfirmation?(): void;
  disableVerticalSwipes?(): void;
  enableVerticalSwipes?(): void;
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

/** Version gate: true only when a real WebApp reports itself at or above `version`. */
function atLeast(w: TelegramWebApp, version: string): boolean {
  return typeof w.isVersionAtLeast === "function" && w.isVersionAtLeast(version);
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

/** Publish one CSS custom property on :root (or clear it when the value is null). */
function setRootVar(name: string, value: string | null): void {
  const root = document.documentElement;
  if (value == null) root.style.removeProperty(name);
  else root.style.setProperty(name, value);
}

/**
 * Mirror Telegram's viewport height + safe areas onto CSS custom properties.
 * The content-safe-area (chrome-aware) is preferred; we fold the device safe-area
 * in as a max() so a value is never smaller than the physical notch. Called on boot
 * and on every viewport/safe-area change event.
 */
function publishViewportVars(w: TelegramWebApp): void {
  if (typeof w.viewportStableHeight === "number" && w.viewportStableHeight > 0) {
    setRootVar("--tg-viewport-stable-height", `${w.viewportStableHeight}px`);
  }
  const content = w.contentSafeAreaInset;
  const device = w.safeAreaInset;
  const side = (k: keyof SafeAreaInset): number => {
    const c = content && typeof content[k] === "number" ? content[k] : 0;
    const d = device && typeof device[k] === "number" ? device[k] : 0;
    return Math.max(c, d);
  };
  // Only publish when Telegram actually gives us insets; otherwise leave the vars unset
  // so the stylesheet's env()/0 fallbacks apply (correct in a plain browser).
  if (content || device) {
    setRootVar("--tg-content-safe-area-inset-top", `${side("top")}px`);
    setRootVar("--tg-content-safe-area-inset-bottom", `${side("bottom")}px`);
    setRootVar("--tg-content-safe-area-inset-left", `${side("left")}px`);
    setRootVar("--tg-content-safe-area-inset-right", `${side("right")}px`);
  }
}

/** Re-apply the cream header/background tint (kept in one place for themeChanged). */
function applyChromeTint(w: TelegramWebApp): void {
  w.setHeaderColor?.(CREAM);
  w.setBackgroundColor?.(CREAM);
}

// The BackButton click handler currently wired (so we can detach it on the next call).
let backHandler: (() => void) | null = null;

export type Credentials = { initData: string } | { devUserId: number };

export const tg = {
  get isTelegram(): boolean {
    return webApp() !== null;
  },

  /** Signal readiness + expand to full height; blend the native chrome; publish viewport vars. */
  ready(): void {
    const w = webApp();
    if (!w) return;
    try {
      w.ready();
      w.expand();
      applyChromeTint(w);
      publishViewportVars(w);
      // Keep the CSS viewport/safe-area vars live as Telegram resizes or the notch changes.
      const onViewport = () => publishViewportVars(w);
      w.onEvent?.("viewportChanged", onViewport);
      w.onEvent?.("safeAreaChanged", onViewport);
      w.onEvent?.("contentSafeAreaChanged", onViewport);
      // Re-tint the native chrome if the user flips their Telegram theme mid-session.
      w.onEvent?.("themeChanged", () => applyChromeTint(w));
    } catch {
      /* never let the bridge break boot */
    }
  },

  /**
   * Review mode: while the user is inside a lesson/review, a stray vertical drag must
   * not close the app and lose an FSRS answer. Turning it ON disables Telegram's
   * pull-to-close vertical swipes (7.7+) and asks for a closing confirmation; turning
   * it OFF restores both. Version-gated and a no-op outside Telegram.
   */
  setReviewMode(on: boolean): void {
    const w = webApp();
    if (!w) return;
    if (on) {
      if (atLeast(w, "7.7")) w.disableVerticalSwipes?.();
      if (atLeast(w, "6.2")) w.enableClosingConfirmation?.();
    } else {
      if (atLeast(w, "7.7")) w.enableVerticalSwipes?.();
      if (atLeast(w, "6.2")) w.disableClosingConfirmation?.();
    }
  },

  /**
   * Drive the native Telegram BackButton (6.1+). `show=true` reveals it and wires
   * `onClick`; `show=false` hides it. We always detach the previous handler first so
   * navigations never stack duplicate callbacks. No-op outside Telegram.
   */
  backButton(show: boolean, onClick?: () => void): void {
    const w = webApp();
    if (!w || !w.BackButton || !atLeast(w, "6.1")) return;
    if (backHandler) {
      w.BackButton.offClick(backHandler);
      backHandler = null;
    }
    if (show) {
      if (onClick) {
        backHandler = onClick;
        w.BackButton.onClick(onClick);
      }
      w.BackButton.show();
    } else {
      w.BackButton.hide();
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
