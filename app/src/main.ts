/**
 * Boot: Telegram ready -> authenticate (initData or dev fallback) -> home.
 * The daily loop starts here: home pulls the live due queue from the server.
 */
import "./styles/fonts.css"; // self-hosted @fontsource faces (no Google Fonts CDN) — must precede tokens
import "./styles/tokens.css";
import "./styles/home.css";
import "./styles/lesson.css";
import "./styles/progress.css";
import "./styles/profile.css";

import { tg } from "./telegram/webapp.ts";
import { session } from "./app/session.ts";
import { router } from "./app/router.ts";
import { applyReducedMotion } from "./app/settings.ts";
import { errorCard, errorDetail, skeletonHome } from "./app/ui.ts";

async function boot(): Promise<void> {
  const root = document.getElementById("app");
  if (!root) return;
  applyReducedMotion(); // honour the persisted reduce-motion preference from the first paint
  tg.ready();
  router.mount(root);

  // Boot loading: the same shaped skeletons as Home, so the very first paint is calm.
  root.innerHTML = `<div class="frame"><div class="home-body">${skeletonHome()}</div></div>`;

  try {
    await session.authenticate();
  } catch (e) {
    // Auth is a network call too — surface it through the SINGLE shared error card + retry,
    // never a raw failure. Retry re-runs the whole boot (re-auth + home).
    root.innerHTML = `<div class="frame"><div class="home-body" style="padding-top:20px">${errorCard(errorDetail(e))}</div></div>`;
    root.querySelector("#retry")?.addEventListener("click", () => {
      tg.impact("light");
      void boot();
    });
    return;
  }

  await router.showHome();

  // Headless / debug surface — real objects, no mocks.
  (window as unknown as { __app: unknown }).__app = {
    session,
    isTelegram: tg.isTelegram,
    openLesson: (id: string) => router.showLesson(id),
    showHome: () => router.showHome(),
    ready: true,
  };
}

void boot();
