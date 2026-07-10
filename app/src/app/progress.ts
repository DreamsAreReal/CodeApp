/**
 * Progress screen (mid design). Renders the whole learning dashboard from a single
 * live /api/progress call — every number is server-derived (FSRS state + append-only
 * history). Nothing is faked: a brand-new user with zero reviews gets a tasteful
 * empty state, and a server outage gets an error-with-retry, exactly like Home.
 *
 * Sections (senior, information-dense but calm): overall mastery ring + headline
 * numbers, an honest grade-mix calibration bar, a 4-week activity heatmap, the
 * forward FSRS schedule (next 7 days), and a per-lesson mastery list.
 */
import { api, ApiError } from "../api/client.ts";
import type { DayCount, GradeMix, LessonProgress, ProgressResponse } from "../api/types.ts";
import { getLesson } from "../lessons/index.ts";
import { S } from "../strings.ts";
import { router } from "./router.ts";
import { tg } from "../telegram/webapp.ts";
import { navBar, wireNav } from "./nav.ts";

function ring(size: number, r: number, sw: number, pct: number, cls: string, label?: string): string {
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return (
    `<div class="${cls}"><svg viewBox="0 0 ${size} ${size}">` +
    `<circle class="track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${sw}"/>` +
    `<circle class="val" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${sw}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/>` +
    `</svg><span class="pct">${label ?? Math.round(pct) + "%"}</span></div>`
  );
}

export async function renderProgress(root: HTMLElement): Promise<void> {
  root.innerHTML = `<div class="frame"><header class="topbar screen-head"><div class="screen-title">${S.progressTitle}</div></header><div class="home-body"><div class="notice">${S.progressLoading}</div></div>${navBar("progress")}</div>`;
  wireNav(root);

  let p: ProgressResponse;
  try {
    p = await api.progress();
  } catch (e) {
    const msg = e instanceof ApiError ? e.message : String(e);
    root.innerHTML = `<div class="frame">
      <header class="topbar screen-head"><div class="screen-title">${S.progressTitle}</div></header>
      <div class="home-body" style="padding-top:24px">
        <div class="notice err"><b>${S.errorTitle}</b><br/>${S.errorBody}<br/><span style="opacity:.7">${escapeHtml(msg)}</span></div>
        <button class="cta" id="retry">${S.retry}</button>
      </div>${navBar("progress")}</div>`;
    root.querySelector<HTMLButtonElement>("#retry")?.addEventListener("click", () => void renderProgress(root));
    wireNav(root);
    (window as unknown as { __progress?: unknown }).__progress = { error: msg };
    return;
  }

  // Empty state — a brand-new user with zero reviews.
  if (p.reviewsTotal === 0) {
    root.innerHTML = `<div class="frame">
      <header class="topbar screen-head"><div class="screen-title">${S.progressTitle}</div></header>
      <div class="home-body">
        <div class="empty">
          <div class="empty-ic" aria-hidden="true">${ICON_CHART}</div>
          <div class="empty-h">${S.progressEmptyTitle}</div>
          <div class="empty-s">${S.progressEmptyBody}</div>
          <button class="cta" id="toLearn"><span>${S.progressEmptyCta}</span>${ICON_ARROW}</button>
        </div>
      </div>${navBar("progress")}</div>`;
    root.querySelector<HTMLButtonElement>("#toLearn")?.addEventListener("click", () => {
      tg.impact("light");
      void router.showHome();
    });
    wireNav(root);
    (window as unknown as { __progress?: unknown }).__progress = {
      userId: p.userId,
      empty: true,
      reviewsTotal: 0,
    };
    return;
  }

  const masteryPct = p.cards.seen > 0 ? (100 * p.cards.mastered) / p.cards.seen : 0;
  const completionPct = p.lessonsTotal > 0 ? (100 * p.lessonsCompleted) / p.lessonsTotal : 0;
  const activeDays = p.activity.filter((d) => d.count > 0).length;

  root.innerHTML = `
  <div class="frame">
    <header class="topbar screen-head">
      <div class="screen-title">${S.progressTitle}</div>
    </header>
    <div class="home-body">
      <div class="greet"><div class="greet-s">${S.progressSub}</div></div>

      <!-- overall mastery -->
      <section class="card mastery">
        <div class="mastery-top">
          ${ring(84, 36, 8, masteryPct, "ring ring-lg", p.cards.mastered + "/" + p.cards.seen)}
          <div class="mastery-body">
            <span class="kicker">${S.masteryLabel}</span>
            <div class="mastery-cap">${
              p.cards.mastered > 0 ? S.masteryCaption(p.cards.mastered, p.cards.seen) : S.masteryCaptionEmpty
            }</div>
          </div>
        </div>
        <div class="metric-grid">
          ${metric(String(p.reviewsTotal), S.statReviews)}
          ${metric(String(p.streakDays), S.statStreak + " · " + S.statStreakUnitDays(p.streakDays))}
          ${metric(String(p.xp), S.statXp)}
          ${metric(String(p.cards.mastered), S.statMastered)}
        </div>
      </section>

      <!-- completion (lesson-viewing) — honest "прохождение", separate from mastery -->
      <div class="sec-label">${S.completionLabel}</div>
      <section class="card">
        <div class="bar" aria-hidden="true"><i style="width:${completionPct.toFixed(0)}%"></i></div>
        <div class="metric-grid">
          ${metric(p.lessonsCompleted + "/" + p.lessonsTotal, S.statLessonsCompleted)}
          ${metric(String(p.lessonsStarted), S.statLessonsStarted)}
          ${metric(String(p.segmentsViewed), S.statSegmentsViewed)}
        </div>
        <div class="hint" style="margin-top:12px">${S.completionCaption}</div>
      </section>

      <!-- grade mix (calibration) -->
      <div class="sec-label">${S.gradeMixLabel}</div>
      <section class="card">
        ${gradeMixBar(p.gradeMix)}
        <div class="hint">${S.gradeMixCaption}</div>
      </section>

      <!-- activity heatmap -->
      <div class="sec-label">${S.heatmapLabel}</div>
      <section class="card">
        ${heatmap(p.activity)}
        <div class="heat-foot">
          <span class="hint">${S.heatmapCaption(activeDays)}</span>
          <span class="heat-legend">${S.heatmapLess}${heatLegendCells()}${S.heatmapMore}</span>
        </div>
      </section>

      <!-- upcoming (forward FSRS schedule) -->
      <div class="sec-label">${S.upcomingLabel}</div>
      <section class="card">
        ${upcoming(p.upcoming)}
        <div class="hint">${S.upcomingCaption}</div>
      </section>

      <!-- per-lesson mastery -->
      <div class="sec-label">${S.perLessonLabel}</div>
      <div class="path lesson-list" id="lessonList">
        ${p.perLesson.map((l) => lessonRow(l)).join("")}
      </div>
    </div>
    ${navBar("progress")}
  </div>`;

  root.querySelectorAll<HTMLElement>("[data-lesson]").forEach((el) => {
    el.addEventListener("click", () => {
      tg.impact("light");
      router.showLesson(el.getAttribute("data-lesson")!);
    });
  });
  wireNav(root);

  // Headless / debug hook — the real rendered state.
  (window as unknown as { __progress?: unknown }).__progress = {
    userId: p.userId,
    empty: false,
    reviewsTotal: p.reviewsTotal,
    streakDays: p.streakDays,
    xp: p.xp,
    daysActive: p.daysActive,
    masteryPct: Math.round(masteryPct),
    cards: p.cards,
    gradeMix: p.gradeMix,
    activityDays: p.activity.length,
    activeDays,
    upcomingDays: p.upcoming.length,
    perLesson: p.perLesson.length,
    // honest completion (lesson-viewing) rollup, separate from card mastery
    completionPct: Math.round(completionPct),
    lessonsTotal: p.lessonsTotal,
    lessonsCompleted: p.lessonsCompleted,
    lessonsStarted: p.lessonsStarted,
    segmentsViewed: p.segmentsViewed,
    perLessonViewing: p.perLesson.map((l) => ({
      lessonId: l.lessonId,
      segmentsSeen: l.segmentsSeen,
      segmentsTotal: l.segmentsTotal,
      completed: l.completed,
      mastered: l.mastered,
      due: l.due,
    })),
    sections: ["mastery", "completion", "gradeMix", "heatmap", "upcoming", "perLesson"],
  };
}

function metric(value: string, label: string): string {
  return `<div class="metric"><span class="metric-n mono">${escapeHtml(value)}</span><span class="metric-l">${escapeHtml(label)}</span></div>`;
}

/** Honest calibration read: a stacked proportional bar of the four grades. */
function gradeMixBar(m: GradeMix): string {
  const total = m.again + m.hard + m.good + m.easy;
  if (total === 0) return `<div class="hint">${S.gradeMixEmpty}</div>`;
  const parts: Array<{ k: string; n: number; label: string }> = [
    { k: "again", n: m.again, label: S.gradeAgain },
    { k: "hard", n: m.hard, label: S.gradeHard },
    { k: "good", n: m.good, label: S.gradeGood },
    { k: "easy", n: m.easy, label: S.gradeEasy },
  ];
  const bar = parts
    .filter((p) => p.n > 0)
    .map((p) => `<span class="gm-seg gm-${p.k}" style="flex:${p.n}" title="${p.label}: ${p.n}"></span>`)
    .join("");
  const legend = parts
    .map(
      (p) =>
        `<span class="gm-key"><i class="gm-dot gm-${p.k}"></i>${p.label} <b class="mono">${p.n}</b></span>`,
    )
    .join("");
  return `<div class="gm-bar" role="img" aria-label="${S.gradeMixLabel}">${bar}</div><div class="gm-legend">${legend}</div>`;
}

/** GitHub-style 4-week grid: columns = weeks, rows = weekday, cream→coral by count. */
function heatmap(days: DayCount[]): string {
  const max = Math.max(1, ...days.map((d) => d.count));
  const cells = days
    .map((d) => {
      const lvl = level(d.count, max);
      return `<span class="heat-cell heat-l${lvl}" title="${escapeHtml(S.heatmapDayTip(d.day, d.count))}"></span>`;
    })
    .join("");
  return `<div class="heat-grid" aria-label="${S.heatmapLabel}">${cells}</div>`;
}

function level(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  const q = count / max;
  if (q > 0.75) return 4;
  if (q > 0.5) return 3;
  if (q > 0.25) return 2;
  return 1;
}

function heatLegendCells(): string {
  return [0, 1, 2, 3, 4].map((l) => `<span class="heat-cell heat-l${l}"></span>`).join("");
}

/** Next-7-days forward FSRS schedule as a small labelled bar timeline. */
function upcoming(days: DayCount[]): string {
  const max = Math.max(1, ...days.map((d) => d.count));
  const hasAny = days.some((d) => d.count > 0);
  if (!hasAny) return `<div class="hint">${S.upcomingEmpty}</div>`;
  const rows = days
    .map((d, i) => {
      const label = i === 0 ? S.upcomingToday : i === 1 ? S.upcomingTomorrow : weekday(d.day);
      const w = max > 0 ? (100 * d.count) / max : 0;
      return `<div class="up-row">
        <span class="up-day">${escapeHtml(label)}</span>
        <div class="up-track"><i style="width:${d.count > 0 ? Math.max(6, w).toFixed(0) : 0}%"></i></div>
        <span class="up-n mono">${d.count}</span>
      </div>`;
    })
    .join("");
  return `<div class="up-list">${rows}</div>`;
}

const WEEKDAYS_RU = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
function weekday(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return WEEKDAYS_RU[d.getUTCDay()] + " " + String(d.getUTCDate());
}

function lessonRow(l: LessonProgress): string {
  const lesson = getLesson(l.lessonId);
  const title = lesson?.title ?? l.lessonId;
  // Ring = HONEST viewing progress (segments seen / total), NOT "cards not due".
  const viewPct = l.segmentsTotal > 0 ? (100 * l.segmentsSeen) / l.segmentsTotal : 0;
  // Right badge: cards to review, else a completion check ONLY if the lesson was viewed through.
  let badge: string;
  if (l.due > 0) {
    badge = `<div class="t-due">${l.due}<small>${S.topicDue}</small></div>`;
  } else if (l.completed) {
    badge = `<div class="t-lock" style="color:var(--sage)" aria-label="${S.perLessonCompleted}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>`;
  } else {
    badge = `<div class="t-lock" aria-hidden="true"></div>`;
  }
  // Sub-line carries BOTH: completion/viewing state + a mastery hint (mastered / total cards).
  const state = l.completed
    ? S.perLessonCompleted
    : l.segmentsSeen > 0
      ? S.perLessonViewingFmt(Math.round(viewPct))
      : S.perLessonNotStarted;
  const sub = `${state} · ${S.perLessonMasteryHint(l.mastered, l.total)}`;
  return `
    <button class="topic" data-lesson="${escapeHtml(l.lessonId)}" title="${escapeHtml(title)}">
      ${ring(40, 16, 4, viewPct, "t-ring", "")}
      <div class="t-body">
        <div class="t-title">${escapeHtml(title)}</div>
        <div class="t-sub">${escapeHtml(sub)}</div>
      </div>
      ${badge}
    </button>`;
}

const ICON_CHART =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M4 20h16"/></svg>';
const ICON_ARROW =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13"/><path d="M13 6l6 6-6 6"/></svg>';

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
