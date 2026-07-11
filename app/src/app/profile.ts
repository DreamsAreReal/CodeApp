/**
 * Profile screen (mid design). Identity comes from Telegram client-side (tg.user());
 * the numbers come from the same live /api/progress call that powers the Progress
 * screen — nothing faked. Also hosts two settings: a persisted "reduce motion" toggle
 * and a heavily-guarded, double-confirmed "reset progress" that only ever deletes THIS
 * user's own FSRS state + history, plus a short honest FSRS meta-transparency exhibit.
 */
import { api } from "../api/client.ts";
import type { ProgressResponse } from "../api/types.ts";
import { S } from "../strings.ts";
import { session } from "./session.ts";
import { router } from "./router.ts";
import { tg } from "../telegram/webapp.ts";
import { navBar, wireNav } from "./nav.ts";
import { reducedMotionEnabled, setReducedMotion } from "./settings.ts";
import { errorCard, errorDetail, skeletonScreen } from "./ui.ts";

/** App version — a single constant, not a fabricated/placeholder value. */
const APP_VERSION = "0.1.0";

export async function renderProfile(root: HTMLElement, navToken: number = router.nav): Promise<void> {
  root.innerHTML = `<div class="frame"><header class="topbar screen-head"><div class="screen-title">${S.profileTitle}</div></header><div class="home-body">${skeletonScreen()}</div>${navBar("profile")}</div>`;
  wireNav(root);

  let p: ProgressResponse;
  try {
    p = await api.progress();
  } catch (e) {
    if (!router.isCurrent(navToken)) return; // a newer navigation won — do not paint over it
    const msg = errorDetail(e);
    root.innerHTML = `<div class="frame">
      <header class="topbar screen-head"><div class="screen-title">${S.profileTitle}</div></header>
      <div class="home-body" style="padding-top:8px">${errorCard(msg)}</div>${navBar("profile")}</div>`;
    root.querySelector<HTMLButtonElement>("#retry")?.addEventListener("click", () => {
      tg.impact("light");
      void renderProfile(root);
    });
    wireNav(root);
    (window as unknown as { __profile?: unknown }).__profile = { error: msg };
    return;
  }

  if (!router.isCurrent(navToken)) return; // a newer navigation won — do not paint over it

  const u = tg.user();
  const first = u?.first_name?.trim() ?? "";
  const last = u?.last_name?.trim() ?? "";
  const fullName = [first, last].filter(Boolean).join(" ") || S.profileDemoName;
  const username = u?.username ? "@" + u.username : S.profileNoUsername;
  const modeLabel = session.mode === "telegram" ? S.profileModeTelegram : S.profileModeDemo;
  const since = p.memberSince ? S.profileMemberSince(formatDate(p.memberSince)) : S.profileMemberSinceUnknown;
  const initials = initialsOf(first, last, u?.username);
  const avatar = u?.photo_url
    ? `<img class="pf-avatar" src="${escapeHtml(u.photo_url)}" alt="" referrerpolicy="no-referrer"/>`
    : `<div class="pf-avatar pf-initials" aria-hidden="true">${escapeHtml(initials)}</div>`;
  const rm = reducedMotionEnabled();

  root.innerHTML = `
  <div class="frame screen-enter">
    <header class="topbar screen-head">
      <div class="screen-title">${S.profileTitle}</div>
    </header>
    <div class="home-body">
      <!-- identity -->
      <section class="card pf-id">
        ${avatar}
        <div class="pf-id-body">
          <div class="pf-name">${escapeHtml(fullName)}</div>
          <div class="pf-user">${escapeHtml(username)}</div>
          <div class="pf-meta">
            <span class="pf-tag ${session.mode === "telegram" ? "pf-tag-tg" : ""}">${escapeHtml(modeLabel)}</span>
            <span class="dot"></span>
            <span class="pf-since">${escapeHtml(since)}</span>
          </div>
        </div>
      </section>

      <!-- summary -->
      <div class="sec-label">${S.summaryLabel}</div>
      <section class="card">
        <div class="metric-grid pf-grid">
          ${metric(String(p.streakDays), S.statStreak + " · " + statDaysWord(p.streakDays))}
          ${metric(String(p.xp), S.statXp)}
          ${metric(String(p.reviewsTotal), S.statReviews)}
          ${metric(String(p.daysActive), S.statDaysActiveWord(p.daysActive))}
        </div>
      </section>

      <!-- how it works (FSRS meta-transparency) -->
      <div class="sec-label">${S.howItWorksLabel}</div>
      <section class="card pf-how">
        <div class="pf-how-ic" aria-hidden="true">${ICON_BRAIN}</div>
        <p class="pf-how-body">${S.howItWorksBody}</p>
      </section>

      <!-- settings -->
      <div class="sec-label">${S.settingsLabel}</div>
      <section class="card pf-settings">
        <div class="pf-row">
          <div class="pf-row-body">
            <div class="pf-row-t">${S.reduceMotionLabel}</div>
            <div class="pf-row-s">${S.reduceMotionHint}</div>
          </div>
          <button class="toggle${rm ? " on" : ""}" id="rmToggle" role="switch" aria-checked="${rm}" aria-label="${S.reduceMotionLabel}">
            <span class="knob"></span>
          </button>
        </div>
      </section>

      <!-- danger zone -->
      <div class="sec-label sec-danger">${S.dangerLabel}</div>
      <section class="card pf-danger">
        <div class="pf-row">
          <div class="pf-row-body">
            <div class="pf-row-t">${S.resetLabel}</div>
            <div class="pf-row-s">${S.resetHint}</div>
          </div>
        </div>
        <div id="resetArea">
          <button class="danger-btn" id="resetBtn">${S.resetLabel}</button>
        </div>
      </section>

      <!-- about -->
      <div class="sec-label">${S.aboutLabel}</div>
      <section class="card pf-about">
        <div class="pf-about-brand"><span class="pf-mark" aria-hidden="true">${ICON_SPARK}</span><b>${S.aboutTitle}</b></div>
        <div class="pf-about-purpose">${S.aboutPurpose}</div>
        <div class="pf-about-ver mono">${S.aboutVersion(APP_VERSION)}</div>
      </section>
    </div>
    ${navBar("profile")}
  </div>`;

  wireNav(root);

  // reduce-motion toggle — persists to localStorage + flips the root class immediately.
  const toggle = root.querySelector<HTMLButtonElement>("#rmToggle");
  toggle?.addEventListener("click", () => {
    const next = !toggle.classList.contains("on");
    setReducedMotion(next);
    toggle.classList.toggle("on", next);
    toggle.setAttribute("aria-checked", String(next));
    tg.impact("light");
  });

  wireReset(root);

  // Headless / debug hook — the real rendered state.
  (window as unknown as { __profile?: unknown }).__profile = {
    userId: p.userId,
    mode: session.mode,
    name: fullName,
    username,
    hasPhoto: Boolean(u?.photo_url),
    initials,
    memberSince: p.memberSince,
    reducedMotion: reducedMotionEnabled(),
    summary: { streak: p.streakDays, xp: p.xp, reviews: p.reviewsTotal, daysActive: p.daysActive },
    version: APP_VERSION,
    sections: ["identity", "summary", "howItWorks", "settings", "danger", "about"],
  };
}

/** Two-step confirm before calling DELETE /api/progress. Guarded so a stray tap can't wipe data. */
function wireReset(root: HTMLElement): void {
  const area = root.querySelector<HTMLElement>("#resetArea");
  if (!area) return;

  const showStep1 = () => {
    area.innerHTML = `<button class="danger-btn" id="resetBtn">${S.resetLabel}</button>`;
    root.querySelector<HTMLButtonElement>("#resetBtn")?.addEventListener("click", showStep2);
  };

  const showStep2 = () => {
    tg.impact("medium");
    area.innerHTML = `
      <div class="reset-confirm">
        <div class="reset-c-t">${S.resetConfirm1}</div>
        <div class="reset-c-s">${S.resetConfirm1Body}</div>
        <div class="reset-actions">
          <button class="ghost-btn" id="resetCancel">${S.resetCancel}</button>
          <button class="danger-btn" id="resetNext">${S.resetProceed}</button>
        </div>
      </div>`;
    root.querySelector<HTMLButtonElement>("#resetCancel")?.addEventListener("click", showStep1);
    root.querySelector<HTMLButtonElement>("#resetNext")?.addEventListener("click", showStep3);
  };

  const showStep3 = () => {
    tg.impact("heavy");
    area.innerHTML = `
      <div class="reset-confirm reset-final">
        <div class="reset-c-t">${S.resetConfirm2}</div>
        <div class="reset-actions">
          <button class="ghost-btn" id="resetCancel2">${S.resetCancel}</button>
          <button class="danger-btn danger-solid" id="resetGo">${S.resetProceed}</button>
        </div>
      </div>`;
    root.querySelector<HTMLButtonElement>("#resetCancel2")?.addEventListener("click", showStep1);
    root.querySelector<HTMLButtonElement>("#resetGo")?.addEventListener("click", doReset);
  };

  const doReset = async () => {
    const go = root.querySelector<HTMLButtonElement>("#resetGo");
    if (go) {
      go.disabled = true;
      go.textContent = S.resetProcessing;
    }
    try {
      await api.resetProgress();
      tg.notify("success");
      area.innerHTML = `<div class="reset-done">${S.resetDone}</div>`;
      // Re-render the profile so every number reflects the wipe (real state, not a guess).
      setTimeout(() => void router.showProfile(), 650);
    } catch {
      tg.notify("error");
      area.innerHTML = `<div class="notice err">${S.resetError}</div><button class="danger-btn" id="resetBtn">${S.resetLabel}</button>`;
      root.querySelector<HTMLButtonElement>("#resetBtn")?.addEventListener("click", showStep2);
    }
  };

  root.querySelector<HTMLButtonElement>("#resetBtn")?.addEventListener("click", showStep2);
}

function metric(value: string, label: string): string {
  return `<div class="metric"><span class="metric-n mono">${escapeHtml(value)}</span><span class="metric-l">${escapeHtml(label)}</span></div>`;
}

function statDaysWord(n: number): string {
  return S.statStreakUnitDays(n);
}

function initialsOf(first: string, last: string, username?: string): string {
  const a = first.charAt(0);
  const b = last.charAt(0);
  const both = (a + b).trim();
  if (both) return both.toUpperCase();
  if (username) return username.charAt(0).toUpperCase();
  return "·";
}

/** Format an ISO timestamp as a Russian "d MMMM yyyy" date (UTC-stable). */
const MONTHS_RU = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];
function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getUTCDate()} ${MONTHS_RU[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const ICON_BRAIN =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-1.5 5.6A3 3 0 0 0 6 17a3 3 0 0 0 6 0V4.5A1.5 1.5 0 0 0 10.5 3z"/><path d="M15 3a3 3 0 0 1 3 3 3 3 0 0 1 1.5 5.6A3 3 0 0 1 18 17a3 3 0 0 1-6 0"/></svg>';
const ICON_SPARK =
  '<svg viewBox="0 0 24 24" fill="none"><path d="M14 2.5c.7 3.4 2 4.7 5.4 5.5-3.4.8-4.7 2.1-5.4 5.5-.7-3.4-2-4.7-5.4-5.5 3.4-.8 4.7-2.1 5.4-5.5z" fill="#fff"/><path d="M7.5 12.5c.4 2 1.2 2.8 3.2 3.3-2 .5-2.8 1.3-3.2 3.3-.4-2-1.2-2.8-3.2-3.3 2-.5 2.8-1.3 3.2-3.3z" fill="#fff" opacity=".82"/></svg>';

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
