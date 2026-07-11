/**
 * Tiny router: swaps the top-level screens (home / progress / profile) and the
 * lesson runner over the single #app root. State is minimal but real — every
 * navigation re-fetches live server data for the target screen.
 */
import { renderHome } from "./home.ts";
import { runLesson } from "./lessonRunner.ts";
import { renderProgress } from "./progress.ts";
import { renderProfile } from "./profile.ts";
import { tg } from "../telegram/webapp.ts";

export type Screen = "home" | "lesson" | "progress" | "profile";

class Router {
  private root!: HTMLElement;
  screen: Screen = "home";
  lessonId: string | null = null;

  mount(root: HTMLElement): void {
    this.root = root;
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
    this.screen = "home";
    this.lessonId = null;
    this.syncChrome("home");
    window.scrollTo(0, 0);
    await renderHome(this.root);
  }

  async showProgress(): Promise<void> {
    this.screen = "progress";
    this.lessonId = null;
    this.syncChrome("progress");
    window.scrollTo(0, 0);
    await renderProgress(this.root);
  }

  async showProfile(): Promise<void> {
    this.screen = "profile";
    this.lessonId = null;
    this.syncChrome("profile");
    window.scrollTo(0, 0);
    await renderProfile(this.root);
  }

  showLesson(id: string): void {
    this.screen = "lesson";
    this.lessonId = id;
    this.syncChrome("lesson");
    window.scrollTo(0, 0);
    runLesson(this.root, id);
  }
}

export const router = new Router();
