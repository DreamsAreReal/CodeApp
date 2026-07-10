/**
 * Tiny router: home <-> lesson. Owns the #app root and swaps screens.
 * State is intentionally minimal (this is a walking skeleton) but real:
 * navigating to home re-fetches the live due queue from the server.
 */
import { renderHome } from "./home.ts";
import { runLesson } from "./lessonRunner.ts";

export type Screen = "home" | "lesson";

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

  showLesson(id: string): void {
    this.screen = "lesson";
    this.lessonId = id;
    window.scrollTo(0, 0);
    runLesson(this.root, id);
  }
}

export const router = new Router();
