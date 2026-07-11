/**
 * Tiny router: swaps the top-level screens (home / progress / profile) and the
 * lesson runner over the single #app root. State is minimal but real — every
 * navigation re-fetches live server data for the target screen.
 */
import { renderHome } from "./home.ts";
import { runLesson } from "./lessonRunner.ts";
import { renderProgress } from "./progress.ts";
import { renderProfile } from "./profile.ts";
import { sessionQueue } from "./sessionQueue.ts";
import { tg } from "../telegram/webapp.ts";

export type Screen = "home" | "lesson" | "progress" | "profile";

class Router {
  private root!: HTMLElement;
  screen: Screen = "home";
  lessonId: string | null = null;
  cardId: string | null = null;
  /**
   * Monotonic navigation token. Every show*() bumps it; an async render that awaited a slow
   * fetch compares its captured token against this before writing to the DOM, and bails if a
   * newer navigation has since happened — so a slow first screen can never repaint over a
   * later-chosen one (the self-jump bug). Read by render* via `router.nav`.
   */
  nav = 0;

  mount(root: HTMLElement): void {
    this.root = root;
  }

  /** True if `token` is still the current navigation (the caller may write to the DOM). */
  isCurrent(token: number): boolean {
    return token === this.nav;
  }

  /**
   * Begin a continuous review session from a live-ordered list of due itemIds and open the
   * first card. Returns false if the queue is empty (caller stays home). The session drives
   * card-to-card advancement until the queue drains (see `advanceSession`).
   */
  startSession(itemIds: string[]): boolean {
    sessionQueue.start(itemIds);
    const first = sessionQueue.current;
    if (!first) return false;
    this.showLesson(first.lessonId, first.cardId);
    return true;
  }

  /**
   * Advance to the next due card in the session. If the queue is now empty the session is over
   * → return home, where the drained due count makes the "День закрыт"/empty states naturally
   * reachable. Called after a card is graded.
   */
  advanceSession(): void {
    const next = sessionQueue.advance();
    if (next) this.showLesson(next.lessonId, next.cardId);
    else void this.showHome();
  }

  /**
   * Sync the native Telegram chrome to the target screen (no-op outside Telegram):
   * home hides the BackButton and leaves review mode; every sub-screen shows the
   * BackButton (which returns to home). Review mode — which blocks the accidental
   * swipe-to-close that would drop an FSRS answer — is only ON inside a lesson.
   */
  private syncChrome(screen: Screen): void {
    if (screen === "home") {
      tg.backButton(false);
      tg.setReviewMode(false);
    } else {
      tg.backButton(true, () => void this.showHome());
      tg.setReviewMode(screen === "lesson");
    }
  }

  async showHome(): Promise<void> {
    const token = ++this.nav;
    this.screen = "home";
    this.lessonId = null;
    this.cardId = null;
    sessionQueue.clear(); // reaching home ends any live session (drained or abandoned)
    this.syncChrome("home");
    window.scrollTo(0, 0);
    await renderHome(this.root, token);
  }

  async showProgress(): Promise<void> {
    const token = ++this.nav;
    this.screen = "progress";
    this.lessonId = null;
    this.cardId = null;
    sessionQueue.clear();
    this.syncChrome("progress");
    window.scrollTo(0, 0);
    await renderProgress(this.root, token);
  }

  async showProfile(): Promise<void> {
    const token = ++this.nav;
    this.screen = "profile";
    this.lessonId = null;
    this.cardId = null;
    sessionQueue.clear();
    this.syncChrome("profile");
    window.scrollTo(0, 0);
    await renderProfile(this.root, token);
  }

  /** Open a lesson at a specific card (default: the lesson's first card). Synchronous render. */
  showLesson(id: string, cardId?: string): void {
    ++this.nav;
    this.screen = "lesson";
    this.lessonId = id;
    this.cardId = cardId ?? null;
    this.syncChrome("lesson");
    window.scrollTo(0, 0);
    runLesson(this.root, id, cardId);
  }
}

export const router = new Router();
