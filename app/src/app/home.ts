/**
 * Home / shell (mid design). Renders the C#-core path from the lesson registry
 * and drives every number from the LIVE backend: streak + XP from /api/stats,
 * the due queue from /api/due, per-lesson totals from /api/lessons. Nothing here
 * is faked — if the server is down, the screen says so and offers a retry.
 */
import { api, ApiError } from "../api/client.ts";
import type { DueResponse, LessonSummary, ProgressResponse, StatsResponse } from "../api/types.ts";
import { LESSONS } from "../lessons/index.ts";
import type { LessonData, LessonIcon } from "../lessons/types.ts";
import { ICON } from "../engine/index.ts";
import { S, plural } from "../strings.ts";
import { session } from "./session.ts";
import { router } from "./router.ts";
import { tg } from "../telegram/webapp.ts";
import { navBar, wireNav } from "./nav.ts";

const TOPIC_ICON: Record<LessonIcon, string> = {
  types: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4-8 4-8-4 8-4z"/><path d="M4 12l8 4 8-4"/><path d="M4 17l8 4 8-4"/></svg>',
  async: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10a8 8 0 0 1 13.5-3.5L20 9"/><path d="M20 4v5h-5"/><path d="M20 14a8 8 0 0 1-13.5 3.5L4 15"/><path d="M4 20v-5h5"/></svg>',
  collections: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/></svg>',
  gc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="14" width="6" height="6" rx="1.4"/><rect x="10.5" y="14" width="6" height="6" rx="1.4"/><rect x="7" y="7.5" width="6" height="6" rx="1.4"/><path d="M17.5 6.8a5 5 0 0 1 2.2 5.4"/><path d="M20.4 12.5l-.7-2 -2 .6"/></svg>',
};

interface LessonRow {
  lesson: LessonData;
  due: number; // cards due for review now (FSRS schedule)
  newCount: number; // of those, brand-new (never reviewed)
  total: number; // cards in the lesson
  mastered: number; // cards durably learnt (stability >= threshold)
  viewPct: number; // HONEST viewing progress: segmentsSeen / segmentsTotal
  completed: boolean; // whole lesson viewed at least once (sticky)
}

function ring(size: number, r: number, sw: number, pct: number, cls: string): string {
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return (
    `<div class="${cls}"><svg viewBox="0 0 ${size} ${size}">` +
    `<circle class="track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${sw}"/>` +
    `<circle class="val" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${sw}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/>` +
    `</svg><span class="pct">${Math.round(pct)}%</span></div>`
  );
}

export async function renderHome(root: HTMLElement): Promise<void> {
  root.innerHTML = `<div class="frame"><div class="home-body"><div class="notice">${S.connecting}</div></div></div>`;

  let due: DueResponse;
  let stats: StatsResponse;
  let catalog: LessonSummary[];
  let prog: ProgressResponse;
  try {
    [due, stats, catalog, prog] = await Promise.all([
      api.due(session.userId),
      api.stats(session.userId),
      api.lessons(),
      api.progress(session.userId),
    ]);
  } catch (e) {
    const msg = e instanceof ApiError ? e.message : String(e);
    root.innerHTML = `<div class="frame"><div class="home-body" style="padding-top:24px">
      <div class="notice err"><b>${S.errorTitle}</b><br/>${S.errorBody}<br/><span style="opacity:.7">${escapeHtml(msg)}</span></div>
      <button class="cta" id="retry">${S.retry}</button></div></div>`;
    root.querySelector<HTMLButtonElement>("#retry")?.addEventListener("click", () => void renderHome(root));
    (window as unknown as { __home?: unknown }).__home = { error: msg };
    return;
  }

  // Group due items by lesson id (itemId = `${lessonId}/${cardId}`).
  const dueByLesson = new Map<string, { due: number; newCount: number }>();
  for (const it of due.items) {
    const lessonId = it.itemId.slice(0, it.itemId.lastIndexOf("/"));
    const g = dueByLesson.get(lessonId) ?? { due: 0, newCount: 0 };
    g.due += 1;
    if (it.isNew) g.newCount += 1;
    dueByLesson.set(lessonId, g);
  }
  const totalByLesson = new Map<string, number>(catalog.map((c) => [c.id, c.cards]));
  // Server-side per-lesson signals (viewing progress + mastery), keyed by lesson id.
  const progByLesson = new Map(prog.perLesson.map((l) => [l.lessonId, l]));

  const rows: LessonRow[] = LESSONS.map((lesson) => {
    const d = dueByLesson.get(lesson.id) ?? { due: 0, newCount: 0 };
    const total = totalByLesson.get(lesson.id) ?? lesson.cards.length;
    const lp = progByLesson.get(lesson.id);
    // HONEST viewing progress: how many segments the user actually saw. Never derived
    // from "cards not currently due" (that overstated mastery after a single review).
    const viewPct = lp && lp.segmentsTotal > 0 ? (100 * lp.segmentsSeen) / lp.segmentsTotal : 0;
    return {
      lesson,
      due: d.due,
      newCount: d.newCount,
      total,
      mastered: lp?.mastered ?? 0,
      viewPct,
      completed: lp?.completed ?? false,
    };
  });

  const knownDue = rows.reduce((a, r) => a + r.due, 0);
  const knownTotal = rows.reduce((a, r) => a + r.total, 0);
  // Overall hero ring = lessons fully viewed / total lessons — a truthful completion
  // number, NOT "cards not due". Falls back to catalog size if the rollup lags.
  const lessonsTotal = prog.lessonsTotal > 0 ? prog.lessonsTotal : rows.length;
  const overallPct = lessonsTotal > 0 ? (100 * prog.lessonsCompleted) / lessonsTotal : 0;
  // Continue with the first lesson the user has NOT finished viewing; else first with due.
  const heroRow = rows.find((r) => !r.completed) ?? rows.find((r) => r.due > 0) ?? rows[0];

  const connLabel = session.mode === "telegram" ? S.authTelegram : S.authDev(session.userId);
  const estMin = heroRow.lesson.home.estMinutes;

  root.innerHTML = `
  <div class="frame">
    <header class="topbar">
      <div class="brand">
        <span class="mark" aria-hidden="true">${ICON.spark}</span>
        <span class="brand-name">${S.brand}</span>
      </div>
      <div class="stats">
        <span class="stat" title="Стрик (сервер)">
          <svg class="ic-streak" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c3.2 3.2 5 6 5 9a5 5 0 0 1-10 0c0-1.6.7-3 1.8-4 .3 1.6 1.1 2.5 2 2.5-1-2.4-.3-5 1.2-7.5z"/></svg>
          <span class="n" id="statStreak">${stats.streakDays}</span><span class="u">${S.statStreakUnit}</span>
        </span>
        <span class="stat" title="Опыт (сервер)">
          <svg class="ic-xp" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5l2.4 5 5.5.7-4 3.8 1 5.4-4.9-2.7L7.1 21.4l1-5.4-4-3.8 5.5-.7z"/></svg>
          <span class="n" id="statXp">${stats.xp}</span>
        </span>
      </div>
    </header>

    <div class="home-body">
      <div class="greet">
        <div class="greet-h">${S.greetTitle}</div>
        <div class="greet-s">${S.greetSub}</div>
      </div>

      <section class="hero" role="button" tabindex="0" id="hero" aria-label="${escapeHtml(heroRow.lesson.title)}">
        <div class="hero-top">
          ${ring(64, 27, 6, overallPct, "ring")}
          <div class="hero-head">
            <span class="kicker">${knownDue > 0 ? S.heroKicker : S.heroAllDone}</span>
            <div class="hero-title">${escapeHtml(heroRow.lesson.title)}</div>
            <div class="hero-meta">
              <span class="mono">${S.heroMinutes(estMin)}</span><span class="dot"></span>
              <span class="mono">${knownDue > 0 ? S.heroCardsDue(knownDue) : S.heroAllDone}</span>
            </div>
          </div>
        </div>
        <div class="bar" aria-hidden="true"><i style="width:${overallPct.toFixed(0)}%"></i></div>
        <div class="bar-cap">
          <span>${S.heroLessonsCompleted(prog.lessonsCompleted, lessonsTotal)}</span>
          <span><span class="mono">${prog.lessonsCompleted}</span>/<span class="mono">${lessonsTotal}</span></span>
        </div>
        <button class="cta" id="heroCta">
          <span>${S.heroContinue}</span>
          ${ICON.arrowR}
        </button>
      </section>

      <div class="sec-label">${S.pathLabel}</div>
      <div class="path" id="path">
        ${rows.map((r, i) => topicRow(r, r === heroRow, i)).join("")}
      </div>

      <div class="notice" id="conn" style="text-align:center">${connLabel} · <b id="connDue">${S.heroCardsDue(knownDue)}</b></div>
    </div>

    ${navBar("home")}
  </div>`;

  wireNav(root);

  const open = (id: string) => {
    tg.impact("light");
    router.showLesson(id);
  };
  root.querySelector<HTMLButtonElement>("#heroCta")?.addEventListener("click", (e) => {
    e.stopPropagation();
    open(heroRow.lesson.id);
  });
  root.querySelector<HTMLElement>("#hero")?.addEventListener("click", () => open(heroRow.lesson.id));
  root.querySelectorAll<HTMLElement>("[data-lesson]").forEach((el) => {
    el.addEventListener("click", () => open(el.getAttribute("data-lesson")!));
  });

  // Headless / debug hook — real state snapshot (now includes the honest signals).
  (window as unknown as { __home?: unknown }).__home = {
    userId: session.userId,
    mode: session.mode,
    streak: stats.streakDays,
    xp: stats.xp,
    knownDue,
    knownTotal,
    overallPct: Math.round(overallPct), // = lessonsCompleted / lessonsTotal (honest)
    lessonsCompleted: prog.lessonsCompleted,
    lessonsStarted: prog.lessonsStarted,
    lessonsTotal,
    segmentsViewed: prog.segmentsViewed,
    lessons: rows.map((r) => ({
      id: r.lesson.id,
      title: r.lesson.title,
      due: r.due,
      total: r.total,
      mastered: r.mastered,
      viewPct: Math.round(r.viewPct),
      completed: r.completed,
    })),
  };
}

function topicRow(r: LessonRow, active: boolean, index: number): string {
  const icon = TOPIC_ICON[r.lesson.home.icon];
  // Right-side status: a due badge when cards need review; else a completion check ONLY
  // when the lesson was actually viewed through. A never-opened lesson with no due cards
  // shows nothing misleading — honesty over a premature green tick.
  const smallLabel = r.newCount === r.due && r.due > 0 ? plural(r.due, "новое", "новых", "новых") : S.topicDue;
  let badge: string;
  if (r.due > 0) {
    badge = `<div class="t-due">${r.due}<small>${smallLabel}</small></div>`;
  } else if (r.completed) {
    badge =
      '<div class="t-lock" style="color:var(--sage)" aria-label="пройдено">' +
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>';
  } else {
    badge = `<div class="t-lock" aria-hidden="true"></div>`;
  }
  // Sub-line: honest viewing progress + mastery hint (mastered / total cards).
  const sub = r.completed
    ? S.topicViewedMastery(r.mastered, r.total)
    : r.viewPct > 0
      ? S.topicViewing(Math.round(r.viewPct))
      : escapeHtml(r.lesson.home.subtitle);
  return `
    <button class="topic${active ? " active" : ""}" data-lesson="${r.lesson.id}" title="${escapeHtml(r.lesson.title)}" style="animation-delay:${index * 40}ms">
      <span class="t-ic" aria-hidden="true">${icon}</span>
      <div class="t-body">
        <div class="t-title">${escapeHtml(r.lesson.title)}</div>
        <div class="t-sub">${sub}</div>
        ${active ? `<span class="pill">${S.topicActive}</span>` : ""}
      </div>
      ${badge}
    </button>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
