/**
 * Home / shell (mid design) — the daily-return loop lives here. It renders the C#-core
 * path from the lesson registry and drives every number from the LIVE backend: streak +
 * XP from /api/stats, the due queue from /api/due, per-lesson totals from /api/lessons,
 * and the viewing/forecast rollup from /api/progress. Nothing is faked.
 *
 * Home is a STATE MACHINE over that live data (all derived client-side, no new backend
 * field). The hero swaps between:
 *   - first-run  : brand-new learner (0 reviews, 0 segments) + not yet onboarded -> warm intro.
 *   - session    : cards are due today -> "Сессия на сегодня" CTA (count + est. minutes).
 *   - done       : nothing due, but the learner was active today -> "День закрыт" close-out
 *                  (XP today + streak + tomorrow preview). A satisfying end, not a void.
 *   - empty-new  : nothing due, lessons still unseen -> "возьми свежий урок".
 *   - empty-all  : nothing due, everything viewed -> "повторяй, чтобы закрепить".
 *
 * The streak is SUPPORTIVE, never shaming: growth/milestone when it is alive, a warm
 * "начни новую серию" when it is 0 — no red, no guilt (RS-01: streak-shaming is harmful).
 */
import { api } from "../api/client.ts";
import type { DueResponse, LessonSummary, ProgressResponse, StatsResponse } from "../api/types.ts";
import { LESSONS } from "../lessons/index.ts";
import type { LessonData, LessonIcon } from "../lessons/types.ts";
import { ICON } from "../engine/index.ts";
import { S, plural } from "../strings.ts";
import { session } from "./session.ts";
import { router } from "./router.ts";
import { tg } from "../telegram/webapp.ts";
import { navBar, wireNav } from "./nav.ts";
import { errorCard, errorDetail, skeletonHome } from "./ui.ts";
import { hasOnboarded, markOnboarded } from "./onboarding.ts";

export const TOPIC_ICON: Record<LessonIcon, string> = {
  types: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 4-8 4-8-4 8-4z"/><path d="M4 12l8 4 8-4"/><path d="M4 17l8 4 8-4"/></svg>',
  async: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10a8 8 0 0 1 13.5-3.5L20 9"/><path d="M20 4v5h-5"/><path d="M20 14a8 8 0 0 1-13.5 3.5L4 15"/><path d="M4 20v-5h5"/></svg>',
  collections: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/></svg>',
  gc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="14" width="6" height="6" rx="1.4"/><rect x="10.5" y="14" width="6" height="6" rx="1.4"/><rect x="7" y="7.5" width="6" height="6" rx="1.4"/><path d="M17.5 6.8a5 5 0 0 1 2.2 5.4"/><path d="M20.4 12.5l-.7-2 -2 .6"/></svg>',
};

const STREAK_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3c3.2 3.2 5 6 5 9a5 5 0 0 1-10 0c0-1.6.7-3 1.8-4 .3 1.6 1.1 2.5 2 2.5-1-2.4-.3-5 1.2-7.5z"/></svg>';

/** Streak milestones we celebrate — sparingly (RS-01). */
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

interface LessonRow {
  lesson: LessonData;
  due: number; // cards due for review now (FSRS schedule)
  newCount: number; // of those, brand-new (never reviewed)
  total: number; // cards in the lesson
  mastered: number; // cards durably learnt (stability >= threshold)
  viewPct: number; // HONEST viewing progress: segmentsSeen / segmentsTotal
  completed: boolean; // whole lesson viewed at least once (sticky)
}

/** Discriminated home hero state, derived purely from live server data + the onboarding flag. */
export type HomeState = "first-run" | "session" | "done" | "empty-new" | "empty-all";

/** Inputs the home state depends on (all live-server-derived except `onboarded`). */
export interface HomeStateInput {
  reviewsTotal: number; // /api/progress
  segmentsViewed: number; // /api/progress
  knownDue: number; // sum of due across lessons (/api/due)
  todayCount: number; // activity[last].count (/api/progress) — did work today?
  allViewed: boolean; // every lesson row completed
  onboarded: boolean; // client onboarding flag
}

/**
 * PURE derivation of the home hero state (unit-testable, no DOM/network). This is the single
 * source of truth for which hero renders — the render path and the harness both use it, so
 * "which state" is provable in isolation. Order matters: a brand-new un-onboarded learner is
 * always greeted (first-run); a live session (due>0) always wins next; then a closed-out day
 * (nothing due but worked today) reads as "done"; the two empty variants split on allViewed.
 */
export function deriveHomeState(i: HomeStateInput): HomeState {
  const brandNew = i.reviewsTotal === 0 && i.segmentsViewed === 0;
  if (brandNew && !i.onboarded) return "first-run";
  if (i.knownDue > 0) return "session";
  if (i.todayCount > 0) return "done";
  return i.allViewed ? "empty-all" : "empty-new";
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

export async function renderHome(root: HTMLElement, navToken: number = router.nav): Promise<void> {
  // Loading: shaped skeletons (not a spinner), inside the real frame so nothing jumps.
  root.innerHTML = `<div class="frame"><div class="home-body">${skeletonHome()}</div>${navBar("home")}</div>`;
  wireNav(root);

  let due: DueResponse;
  let stats: StatsResponse;
  let catalog: LessonSummary[];
  let prog: ProgressResponse;
  try {
    [due, stats, catalog, prog] = await Promise.all([api.due(), api.stats(), api.lessons(), api.progress()]);
  } catch (e) {
    if (!router.isCurrent(navToken)) return; // a newer navigation won — do not paint over it
    const msg = errorDetail(e);
    root.innerHTML = `<div class="frame"><div class="home-body" style="padding-top:20px">${errorCard(msg)}</div>${navBar("home")}</div>`;
    root.querySelector<HTMLButtonElement>("#retry")?.addEventListener("click", () => {
      tg.impact("light");
      void renderHome(root);
    });
    wireNav(root);
    (window as unknown as { __home?: unknown }).__home = { error: msg, state: "error" };
    return;
  }

  if (!router.isCurrent(navToken)) return; // a newer navigation won — do not paint over it

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
  const progByLesson = new Map(prog.perLesson.map((l) => [l.lessonId, l]));

  const rows: LessonRow[] = LESSONS.map((lesson) => {
    const d = dueByLesson.get(lesson.id) ?? { due: 0, newCount: 0 };
    const total = totalByLesson.get(lesson.id) ?? lesson.cards.length;
    const lp = progByLesson.get(lesson.id);
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
  const lessonsTotal = prog.lessonsTotal > 0 ? prog.lessonsTotal : rows.length;
  const overallPct = lessonsTotal > 0 ? (100 * prog.lessonsCompleted) / lessonsTotal : 0;
  const allViewed = rows.every((r) => r.completed);
  // The first lesson the learner has NOT finished viewing (the natural "next new" target);
  // falls back to the first with due cards, then the first row.
  const nextUnseen = rows.find((r) => !r.completed);
  const heroRow = nextUnseen ?? rows.find((r) => r.due > 0) ?? rows[0];

  // Was the learner active TODAY? activity[] is 28 days ending today (UTC); the last bucket
  // is today. Used to distinguish "день закрыт" (did work, now clear) from a plain empty day.
  const todayCount = prog.activity.length ? prog.activity[prog.activity.length - 1].count : 0;
  const tomorrowDue = prog.upcoming.length > 1 ? prog.upcoming[1].count : 0;
  // XP earned today ~ today's reviews * 10 (server XP model). Honest lower bound from activity.
  const xpToday = todayCount * 10;

  const onboarded = hasOnboarded();

  const state: HomeState = deriveHomeState({
    reviewsTotal: prog.reviewsTotal,
    segmentsViewed: prog.segmentsViewed,
    knownDue,
    todayCount,
    allViewed,
    onboarded,
  });

  const connLabel = session.mode === "telegram" ? S.authTelegram : S.authDev(session.userId);
  const heroCtx: HeroCtx = {
    heroRow,
    knownDue,
    overallPct,
    lessonsCompleted: prog.lessonsCompleted,
    lessonsTotal,
    streakDays: stats.streakDays,
    xpToday,
    tomorrowDue,
    freshLessonId: nextUnseen ? nextUnseen.lesson.id : null,
  };

  root.innerHTML = `
  <div class="frame screen-enter">
    <header class="topbar">
      <div class="brand">
        <span class="mark" aria-hidden="true">${ICON.spark}</span>
      </div>
      <div class="stats">
        <span class="stat" title="Серия (сервер)">
          ${STREAK_ICON}
          <span class="n" id="statStreak">${stats.streakDays}</span><span class="u">${S.statStreakUnitDays(stats.streakDays)}</span>
        </span>
        <span class="stat" title="XP (сервер)">
          <svg class="ic-xp" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5l2.4 5 5.5.7-4 3.8 1 5.4-4.9-2.7L7.1 21.4l1-5.4-4-3.8 5.5-.7z"/></svg>
          <span class="n" id="statXp">${stats.xp}</span>
        </span>
      </div>
    </header>

    <div class="home-body">
      <div id="heroSlot">${greetBlock(state)}${heroFor(state, heroCtx)}</div>

      <div class="sec-label">${S.pathLabel}</div>
      <div class="path" id="path">
        ${rows.map((r, i) => topicRow(r, r === heroRow && state !== "first-run", i, knownDue > 0)).join("")}
      </div>

      <div class="notice" id="conn" style="text-align:center">${connLabel} · <b id="connDue">${S.heroCardsDue(knownDue)}</b></div>
    </div>

    ${navBar("home")}
  </div>`;

  wireNav(root);

  // Ordered due itemIds straight off the live queue (backend order = FSRS priority).
  const dueIds = due.items.map((it) => it.itemId);

  // Open a single lesson at its first card (re-view / first-run / no due cards to run).
  const open = (id: string) => {
    markOnboarded(); // starting any lesson counts as onboarded — the intro never nags again
    tg.impact("light");
    router.showLesson(id);
  };

  // Start a CONTINUOUS session over a set of due itemIds: the runner advances card-to-card
  // until the queue drains, only then returning home. Falls back to opening `fallbackLessonId`
  // as a single lesson when there is nothing due to run.
  const startSession = (itemIds: string[], fallbackLessonId: string) => {
    markOnboarded();
    tg.impact("light");
    if (!router.startSession(itemIds)) router.showLesson(fallbackLessonId);
  };

  // Wire the hero CTA + first-run skip for a given state. Extracted so a forced hero
  // re-render (verification hook below) re-wires the same real handlers.
  const wireHero = (forState: HomeState) => {
    root.querySelector<HTMLButtonElement>("#heroCta")?.addEventListener("click", (e) => {
      e.stopPropagation();
      // The daily "session" CTA runs the WHOLE due queue as one continuous session; every
      // other state opens a single lesson (first-run starter, empty-new fresh lesson, revisit).
      if (forState === "session") startSession(dueIds, ctaTarget(forState, rows, heroRow));
      else open(ctaTarget(forState, rows, heroRow));
    });
    root.querySelector<HTMLButtonElement>("#onboardSkip")?.addEventListener("click", (e) => {
      e.stopPropagation();
      markOnboarded();
      tg.impact("light");
      void renderHome(root);
    });
    // Optional secondary CTA on a closed day: open the first not-yet-viewed lesson (a fresh lesson,
    // not the due session). Only present when `heroCtx.freshLessonId` was set (unseen lessons remain).
    root.querySelector<HTMLButtonElement>("#heroFresh")?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (heroCtx.freshLessonId) open(heroCtx.freshLessonId);
    });
  };
  wireHero(state);

  root.querySelectorAll<HTMLElement>("[data-lesson]").forEach((el) => {
    el.addEventListener("click", () => {
      const lessonId = el.getAttribute("data-lesson")!;
      // Tapping a topic runs ITS due cards as a session; with none due it opens for re-view.
      const lessonDue = dueIds.filter((id) => id.startsWith(lessonId + "/"));
      if (lessonDue.length > 0) startSession(lessonDue, lessonId);
      else open(lessonId);
    });
  });

  // Verification hook — re-render the hero slot for ANY state using the REAL greet/hero render
  // functions and the CURRENT live context. This lets the headless harness screenshot + DOM-assert
  // every hero branch (incl. empty-new / empty-all, which need a day with no activity that cannot
  // be manufactured against a live backend in one session). It renders real markup, not a mock.
  (window as unknown as { __forceHomeHero?: (s: HomeState) => void }).__forceHomeHero = (s: HomeState) => {
    const slot = root.querySelector<HTMLElement>("#heroSlot");
    if (!slot) return;
    slot.innerHTML = greetBlock(s) + heroFor(s, heroCtx);
    wireHero(s);
    (window as unknown as { __homeForced?: string }).__homeForced = s;
  };

  // Headless / debug hook — real state snapshot, now including the derived home state.
  // Guard the write with router.isCurrent: publish __home ONLY for the render that is still
  // current, so a slower/stale renderHome (whose fetch resolved late) can never overwrite the
  // hook with an out-of-date snapshot that no longer matches what is on screen. This does not
  // change any product behaviour — only the consistency of the debug/auto-check observable.
  if (!router.isCurrent(navToken)) return;
  (window as unknown as { __home?: unknown }).__home = {
    userId: session.userId,
    mode: session.mode,
    state,
    streak: stats.streakDays,
    xp: stats.xp,
    xpToday,
    tomorrowDue,
    todayCount,
    knownDue,
    knownTotal,
    overallPct: Math.round(overallPct),
    lessonsCompleted: prog.lessonsCompleted,
    lessonsStarted: prog.lessonsStarted,
    lessonsTotal,
    segmentsViewed: prog.segmentsViewed,
    reviewsTotal: prog.reviewsTotal,
    allViewed,
    onboarded,
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

/** Where the primary CTA leads, per state. */
function ctaTarget(state: HomeState, rows: LessonRow[], heroRow: LessonRow): string {
  if (state === "session") {
    // Start with the first lesson that actually has due cards (the real session).
    return (rows.find((r) => r.due > 0) ?? heroRow).lesson.id;
  }
  if (state === "empty-new") {
    return (rows.find((r) => !r.completed) ?? heroRow).lesson.id;
  }
  if (state === "done" || state === "empty-all") {
    // Something to revisit: prefer a lesson with due cards, else the first row (re-view).
    return (rows.find((r) => r.due > 0) ?? rows[0]).lesson.id;
  }
  // first-run -> the value-types starter if present, else the first lesson.
  return (rows.find((r) => r.lesson.id.includes("value-vs-reference")) ?? rows[0]).lesson.id;
}

/** Greet copy above the hero — tuned to the state so the first screen reads as intentional. */
function greetBlock(state: HomeState): string {
  if (state === "first-run") return ""; // the onboarding hero carries its own copy
  // On a closed/empty day the "let's continue today" line would contradict the hero below,
  // so we switch to a calm "today's part is behind you" subtitle for coherence.
  const sub = state === "session" ? S.greetSub : S.greetSubClear;
  return `<div class="greet"><div class="greet-h">${S.greetTitle}</div><div class="greet-s">${sub}</div></div>`;
}

interface HeroCtx {
  heroRow: LessonRow;
  knownDue: number;
  overallPct: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  streakDays: number;
  xpToday: number;
  tomorrowDue: number;
  // id of the first not-yet-viewed lesson (a fresh lesson to take), or null when everything is viewed.
  // Powers the OPTIONAL secondary "take a fresh lesson" CTA on a closed day.
  freshLessonId: string | null;
}

/** Render the hero card for the current state. */
function heroFor(state: HomeState, c: HeroCtx): string {
  if (state === "first-run") return onboardingHero();
  if (state === "done") return doneHero(c);
  if (state === "empty-new") return emptyHero("new", c);
  if (state === "empty-all") return emptyHero("all", c);
  return sessionHero(c); // "session"
}

/** First-run intro — warm, one screen, one clear starter action + a low-key "look around". */
function onboardingHero(): string {
  return `
  <section class="hero hero-onboard" id="hero" aria-label="${esc(S.onboardTitle)}">
    <span class="kicker">${S.onboardKicker}</span>
    <div class="hero-title">${esc(S.onboardTitle)}</div>
    <p class="hero-lead">${esc(S.onboardBody)}</p>
    <button class="cta" id="heroCta"><span>${S.onboardCta}</span>${ICON.arrowR}</button>
    <button class="hero-skip" id="onboardSkip" type="button">${S.onboardSkip}</button>
  </section>`;
}

/** "Сессия на сегодня" — the rewarding daily action (due count + estimated minutes). */
function sessionHero(c: HeroCtx): string {
  // Session minutes scale with the number of due cards (~1 min/card, minimum 1) — not a fixed 7,
  // so a 2-card day never reads as "~7 минут". The card count is the DAY'S leading metric.
  const min = Math.max(1, Math.round(c.knownDue));
  return `
  <section class="hero" id="hero" aria-label="${esc(c.heroRow.lesson.title)}">
    <div class="hero-top">
      ${ring(64, 27, 6, c.overallPct, "ring")}
      <div class="hero-head">
        <span class="kicker">${S.sessionKicker}</span>
        <div class="hero-title">${esc(c.heroRow.lesson.title)}</div>
        <div class="hero-meta">
          <span class="mono">${S.sessionMeta(c.knownDue, min)}</span>
        </div>
      </div>
    </div>
    ${progressBar(c)}
    <button class="cta" id="heroCta"><span>${S.sessionCta}</span>${ICON.arrowR}</button>
    ${streakLine(c.streakDays)}
  </section>`;
}

/** "День закрыт" — satisfying close-out with XP today, streak, and a tomorrow forward-hook. */
function doneHero(c: HeroCtx): string {
  const chips =
    `<span class="done-chip xp">${S.doneXpToday(c.xpToday)}</span>` +
    `<span class="done-chip streak">${STREAK_ICON}${S.doneStreakLine(c.streakDays)}</span>`;
  // The day is DONE — this secondary link is purely optional (only when a fresh lesson exists).
  // It never pressures: it sits below the come-back line as a quiet "there's more if you want it".
  const fresh = c.freshLessonId
    ? `<button class="hero-fresh" id="heroFresh" type="button">${S.doneFreshCta}${ICON.arrowR}</button>`
    : "";
  return `
  <section class="hero hero-done" id="hero" aria-label="${esc(S.doneTitle)}">
    <span class="done-seal" aria-hidden="true">${SEAL_ICON}</span>
    <span class="kicker kicker-sage">${S.doneKicker}</span>
    <div class="hero-title">${S.doneTitle}</div>
    <p class="hero-lead">${S.doneBody}</p>
    <div class="done-chips">${chips}</div>
    <div class="done-tomorrow">${TOMORROW_ICON}<span>${S.doneTomorrow(c.tomorrowDue)}</span></div>
    <div class="done-comeback">${S.doneComeBack(c.streakDays)}</div>
    <div class="done-fsrs">${SCHEDULE_ICON}<span>${S.doneFsrsHook}</span></div>
    ${fresh}
  </section>`;
}

/** Empty (no due): "new" = lessons still unseen; "all" = everything viewed, keep reinforcing. */
function emptyHero(kind: "new" | "all", c: HeroCtx): string {
  const isNew = kind === "new";
  const kicker = isNew ? S.emptyNewKicker : S.emptyAllKicker;
  const title = isNew ? S.emptyNewTitle : S.emptyAllTitle;
  const body = isNew ? S.emptyNewBody : S.emptyAllBody;
  const cta = isNew ? S.emptyNewCta : S.emptyAllCta;
  const tomorrow = c.tomorrowDue > 0 ? `<div class="done-tomorrow">${TOMORROW_ICON}<span>${S.doneTomorrow(c.tomorrowDue)}</span></div>` : "";
  // Streak forward-hook — a warm "come back tomorrow -> N+1" line, only when a streak is alive
  // (at 0 the streakLine below already invites a fresh start, so we don't double up).
  const comeback = c.streakDays > 0 ? `<div class="done-comeback">${S.doneComeBack(c.streakDays)}</div>` : "";
  // "all" = the whole foundation is viewed: give the completion a heavier seal (mirrors done-hero),
  // distinct from the routine empty-new which is just "no cards, take a fresh lesson".
  const seal = isNew ? "" : `<span class="done-seal" aria-hidden="true">${SEAL_ICON}</span>`;
  return `
  <section class="hero hero-empty${isNew ? "" : " hero-sealed"}" id="hero" aria-label="${esc(title)}">
    ${seal}
    <span class="kicker ${isNew ? "" : "kicker-sage"}">${kicker}</span>
    <div class="hero-title">${title}</div>
    <p class="hero-lead">${body}</p>
    ${tomorrow}
    ${comeback}
    <button class="cta" id="heroCta"><span>${cta}</span>${ICON.arrowR}</button>
    ${streakLine(c.streakDays)}
  </section>`;
}

/**
 * Topic-progress bar (lessons viewed) — a SECONDARY, longer-horizon metric, deliberately set
 * apart from the day's leading "N карточек" figure in .hero-meta so the two units never read as
 * one. Its own quiet label ("Темы курса") makes clear this bar counts topics, not today's cards.
 */
function progressBar(c: HeroCtx): string {
  return (
    `<div class="hero-prog">` +
    `<div class="hero-prog-h"><span>${S.pathTopicsLabel}</span>` +
    `<span><span class="mono">${c.lessonsCompleted}</span>/<span class="mono">${c.lessonsTotal}</span></span></div>` +
    `<div class="bar" aria-hidden="true"><i style="width:${c.overallPct.toFixed(0)}%"></i></div>` +
    `<div class="bar-cap"><span>${S.heroLessonsCompleted(c.lessonsCompleted, c.lessonsTotal)}</span></div>` +
    `</div>`
  );
}

/**
 * Supportive streak line — celebrates growth/milestones, warmly invites a restart at 0.
 * NEVER shames a break: no red, no "you lost your streak", no guilt (RS-01).
 */
function streakLine(streakDays: number): string {
  let cls = "streak-line";
  let text: string;
  if (streakDays === 0) {
    cls += " streak-fresh";
    text = S.streakFresh;
  } else if (STREAK_MILESTONES.includes(streakDays)) {
    cls += " streak-milestone";
    text = S.streakMilestone(streakDays);
  } else {
    text = S.streakGrow(streakDays);
  }
  return `<div class="${cls}">${STREAK_ICON}<span>${text}</span></div>`;
}

function topicRow(r: LessonRow, active: boolean, index: number, hasSession: boolean): string {
  const icon = TOPIC_ICON[r.lesson.home.icon];
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
        ${active && hasSession ? `<span class="pill">${S.topicActive}</span>` : ""}
      </div>
      ${badge}
    </button>`;
}

const SEAL_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>';
const TOMORROW_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17"/><path d="M8 3v4M16 3v4"/></svg>';
const SCHEDULE_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5l3 2"/></svg>';

function esc(s: string): string {
  return escapeHtml(s);
}
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
