/**
 * Boot: Telegram ready -> authenticate (initData or dev fallback) -> home.
 * The daily loop starts here: home pulls the live due queue from the server.
 */
import "./styles/tokens.css";
import "./styles/home.css";
import "./styles/lesson.css";

import { tg } from "./telegram/webapp.ts";
import { session } from "./app/session.ts";
import { router } from "./app/router.ts";
import { S } from "./strings.ts";

async function boot(): Promise<void> {
  const root = document.getElementById("app");
  if (!root) return;
  tg.ready();
  router.mount(root);

  root.innerHTML = `<div class="frame"><div class="home-body" style="padding-top:40px"><div class="notice">${S.connecting}</div></div></div>`;

  try {
    await session.authenticate();
  } catch (e) {
    root.innerHTML = `<div class="frame"><div class="home-body" style="padding-top:40px"><div class="notice err"><b>${S.errorTitle}</b><br/>${S.errorBody}<br/><span style="opacity:.7">${(e as Error).message}</span></div><button class="cta" id="retry">${S.retry}</button></div></div>`;
    root.querySelector("#retry")?.addEventListener("click", () => void boot());
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
