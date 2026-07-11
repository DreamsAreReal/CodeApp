/**
 * Shared bottom navigation for the three top-level screens (Learn / Progress /
 * Profile). Extracted verbatim from the original home markup so every screen
 * carries one identical nav — only the `active` tab differs. `wireNav` attaches
 * the click handlers that drive the router (with a light haptic tap).
 */
import { S } from "../strings.ts";
import { router } from "./router.ts";
import { tg } from "../telegram/webapp.ts";

export type NavTab = "home" | "progress" | "profile";

const ICON_LEARN =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5L12 4l9 7.5"/><path d="M5 10v9h5v-5h4v5h5v-9"/></svg>';
const ICON_PROGRESS =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M4 20h16"/></svg>';
const ICON_PROFILE =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8.5" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>';

function tab(id: NavTab, active: NavTab, label: string, icon: string): string {
  const on = id === active;
  return (
    `<button class="tab${on ? " active" : ""}" data-nav="${id}" title="${label}"` +
    `${on ? ' aria-current="page"' : ""}>${icon}<span class="lbl">${label}</span></button>`
  );
}

/** Bottom-nav markup with the given tab marked active. */
export function navBar(active: NavTab): string {
  return (
    `<nav class="nav">` +
    tab("home", active, S.navLearn, ICON_LEARN) +
    tab("progress", active, S.navProgress, ICON_PROGRESS) +
    tab("profile", active, S.navProfile, ICON_PROFILE) +
    `</nav>`
  );
}

/** Attach click handlers to the nav rendered inside `root`. */
export function wireNav(root: HTMLElement): void {
  root.querySelectorAll<HTMLButtonElement>("[data-nav]").forEach((el) => {
    el.addEventListener("click", () => {
      const target = el.getAttribute("data-nav") as NavTab;
      if (el.classList.contains("active")) return; // already here — no-op
      tg.selection(); // tab switch = selection-change haptic (per Telegram guidelines)
      if (target === "home") void router.showHome();
      else if (target === "progress") void router.showProgress();
      else void router.showProfile();
    });
  });
}
