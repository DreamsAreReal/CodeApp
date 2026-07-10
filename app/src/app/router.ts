/**
 * Tiny router: swaps the top-level screens (home / progress / profile) and the
 * lesson runner over the single #app root. State is minimal but real — every
 * navigation re-fetches live server data for the target screen.
 */
import { renderHome } from "./home.ts";
import { runLesson } from "./lessonRunner.ts";
import { renderProgress } from "./progress.ts";
import { renderProfile } from "./profile.ts";

export type Screen = "home" | "lesson" | "progress" | "profile";

class Router {
  private root!: HTMLElement;
  screen: Screen = "home";
  lessonId: string | null = null;

  mount(root: HTMLElement): void {
    this.root = root;
  }

  async showHome(): Promise<void> {
    this.screen = "home";
    this.lessonId = null;
    window.scrollTo(0, 0);
    await renderHome(this.root);
  }

  async showProgress(): Promise<void> {
    this.screen = "progress";
    this.lessonId = null;
    window.scrollTo(0, 0);
    await renderProgress(this.root);
  }

  async showProfile(): Promise<void> {
    this.screen = "profile";
    this.lessonId = null;
    window.scrollTo(0, 0);
    await renderProfile(this.root);
  }

  showLesson(id: string): void {
    this.screen = "lesson";
    this.lessonId = id;
    window.scrollTo(0, 0);
    runLesson(this.root, id);
  }
}

export const router = new Router();
