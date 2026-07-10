/**
 * LessonRunner — a GENERIC renderer for any lesson-as-data. It is not aware of
 * boxing or value-vs-reference specifically: it walks `lesson.segments[]` and
 * mounts each one as its own animated card (shared living-diagram engine), then
 * the predict MCQ and the FSRS grade strip that CLOSES THE LOOP:
 *
 *   answer card -> grade (1..4) -> POST /api/review -> schedule moves on the
 *   server -> returning home re-fetches /api/due (the due count drops).
 *
 * Add a lesson (data file + registry line) and it renders here with zero UI code.
 */
import { api } from "../api/client.ts";
import type { Grade, ReviewResponse } from "../api/types.ts";
import { ICON, VizPlayer, prefersReducedMotion, hlCode, esc } from "../engine/index.ts";
import type { VizElements, VizPlayer as VizPlayerType } from "../engine/index.ts";
import { getLesson } from "../lessons/index.ts";
import type { Card, LessonData, Segment, Source } from "../lessons/types.ts";
import { S } from "../strings.ts";
import { session } from "./session.ts";
import { router } from "./router.ts";
import { tg } from "../telegram/webapp.ts";

const REDUCED = prefersReducedMotion();

const VIZ_UI = {
  stepFmt: S.stepFmt,
  predictTitle: S.predictTitle,
  predictShow: S.predictShow,
  play: S.play,
  pause: S.pause,
};

interface Built {
  card: HTMLElement;
  viz: VizPlayerType;
}

/** Progress + XP for the current lesson session (visual; truth is server-side). */
class LessonProgress {
  private xp = 0;
  private maxPct = 6;
  private segDone = new Set<string>();
  constructor(
    private segTotal: number,
    private xpEl: HTMLElement,
    private fillEl: HTMLElement,
    private chipEl: HTMLElement,
  ) {}
  setPct(pct: number): void {
    this.maxPct = Math.max(this.maxPct, Math.min(100, Math.round(pct)));
    this.fillEl.style.width = this.maxPct + "%";
    viz().progress = this.maxPct;
  }
  markSeg(id: string): void {
    if (this.segDone.has(id)) return;
    this.segDone.add(id);
    this.addXp(2);
    this.setPct(6 + (this.segDone.size / this.segTotal) * 70);
  }
  addXp(n: number): void {
    this.xp += n;
    this.xpEl.textContent = String(this.xp);
    this.chipEl.classList.remove("bump");
    void this.chipEl.offsetWidth;
    this.chipEl.classList.add("bump");
    viz().xp = this.xp;
  }
  bumpTo(pct: number): void {
    this.setPct(pct);
  }
}

interface VizRegistry {
  segments: Record<string, VizPlayerType["state"]>;
  vizByKey: Record<string, VizPlayerType>;
  ready: boolean;
  progress: number;
  xp: number;
  forcePlayAll: () => void;
}
function viz(): VizRegistry {
  return (window as unknown as { __viz: VizRegistry }).__viz;
}

/**
 * Reports lesson-viewing progress to the server (segments seen / completion).
 * Purely fire-and-forget: errors are swallowed so a report can never block or break
 * the lesson UI. `segmentsSeen` is the count of DISTINCT segment indexes that have
 * entered the viewport (max index + 1); the server UPSERT is monotonic, so duplicate
 * or out-of-order reports are harmless. Partial reports are debounced.
 */
class LessonReporter {
  private maxSeen = 0; // highest (index+1) of a segment that has entered the viewport
  private completed = false;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private lessonId: string,
    private total: number,
  ) {}

  /** A segment (0-based index) became visible. Debounced partial report. */
  markVisible(index: number): void {
    const seen = Math.min(this.total, index + 1);
    if (seen <= this.maxSeen) return;
    this.maxSeen = seen;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.send(false), 400);
  }

  /** The user reached the end of the lesson (graded the card). Completion sticks. */
  markCompleted(): void {
    if (this.completed) return;
    this.completed = true;
    this.maxSeen = this.total;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.send(true);
  }

  private send(completed: boolean): void {
    // Fire-and-forget: never await, never surface errors to the UI.
    void api
      .reportLessonProgress(session.userId, this.lessonId, this.maxSeen, this.total, completed)
      .then((res) => {
        (window as unknown as { __lessonProgress?: unknown }).__lessonProgress = res;
      })
      .catch(() => {
        /* swallow — reporting is best-effort telemetry, not part of the loop */
      });
  }
}

export function runLesson(root: HTMLElement, lessonId: string): void {
  const lesson = getLesson(lessonId);
  if (!lesson) {
    root.innerHTML = `<div class="frame"><div class="lesson-body" style="padding-top:24px"><div class="notice err"><b>${S.errorTitle}</b><br/>Урок «${esc(lessonId)}» не найден.</div><button class="cta" id="back">${S.toHome}</button></div></div>`;
    root.querySelector("#back")?.addEventListener("click", () => void router.showHome());
    return;
  }

  (window as unknown as { __viz: VizRegistry }).__viz = {
    segments: {},
    vizByKey: {},
    ready: false,
    progress: 6,
    xp: 0,
    forcePlayAll: () => {},
  };

  root.innerHTML = shell(lesson);

  const el = <T extends HTMLElement = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const progress = new LessonProgress(lesson.segments.length, el("#xpN"), el("#lprogFill"), el("#xpChip"));
  // Server-side lesson-viewing telemetry (segments seen / completion). Fire-and-forget.
  const reporter = new LessonReporter(lesson.id, lesson.segments.length);

  // ---- build animated segments ----
  const hostTop = el("#segHostTop");
  const hostRest = el("#segHostRest");
  const built: Built[] = [];
  lesson.segments.forEach((seg, i) => {
    const b = buildSegment(lesson, seg, () => progress.markSeg(seg.id));
    (i < 2 ? hostTop : hostRest).appendChild(b.card);
    viz().vizByKey[seg.id] = b.viz;
    viz().segments[seg.id] = b.viz.state;
    built.push(b);
  });

  // ---- MCQ + grade (closes the loop) ----
  buildMcq(root, lesson, progress, reporter);

  // ---- reconstruct + sources ----
  el("#secRecon").innerHTML = reconstruct(lesson);

  // ---- top-bar wiring ----
  el("#btnClose").addEventListener("click", () => {
    tg.impact("light");
    void router.showHome();
  });
  el<HTMLButtonElement>("#btnNext")?.addEventListener("click", () => void router.showHome());

  progress.setPct(6);

  // ---- autoplay on scroll-into-view ----
  if (REDUCED) {
    built.forEach((b, i) => {
      b.viz.showFinal();
      reporter.markVisible(i); // all segments are shown at once in reduced-motion
    });
    // mark all segments complete (static final frames)
    lesson.segments.forEach((seg) => progress.markSeg(seg.id));
  } else if ("IntersectionObserver" in window) {
    built.forEach((b, i) => {
      let started = false;
      // Report the moment a segment enters the viewport (even before autoplay begins),
      // so "segments seen" tracks how far the user scrolled — the honest viewing signal.
      const seenIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting && en.intersectionRatio >= 0.35) {
              reporter.markVisible(i);
              seenIo.disconnect();
            }
          });
        },
        { threshold: [0, 0.35] },
      );
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting && en.intersectionRatio >= 0.35 && !started) {
              started = true;
              b.viz.play();
              io.disconnect();
            }
          });
        },
        { threshold: [0, 0.35, 0.6] },
      );
      const stage = b.card.querySelector(".stage");
      if (stage) {
        seenIo.observe(stage);
        io.observe(stage);
      }
    });
  } else {
    built.forEach((b, i) => {
      b.viz.play();
      reporter.markVisible(i);
    });
  }

  // headless helper: jump every segment to its final frame, resolving predicts.
  viz().forcePlayAll = () => {
    lesson.segments.forEach((seg, i) => {
      const v = viz().vizByKey[seg.id];
      if (v) v.showFinal();
      progress.markSeg(seg.id);
      reporter.markVisible(i);
    });
  };
  viz().ready = true;
  (window as unknown as { __lesson: unknown }).__lesson = { id: lesson.id, segments: lesson.segments.length };
}

// ---------------------------------------------------------------------------

function shell(lesson: LessonData): string {
  return `
  <div class="frame">
    <header class="lbar">
      <button class="close" id="btnClose" title="${S.close}" aria-label="${S.close}">${ICON.close}</button>
      <div class="lprog" aria-hidden="true"><i id="lprogFill"></i></div>
      <span class="xp" id="xpChip" title="Опыт за урок">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l2.4 5 5.5.7-4 3.8 1 5.4-4.9-2.7L7.1 21.4l1-5.4-4-3.8 5.5-.7z"/></svg>
        <b id="xpN">0</b><span class="u">${S.xpUnit}</span>
      </span>
    </header>
    <div class="lesson-body">
      <div class="lesson-head">
        <div class="lesson-kicker">${esc(lesson.kicker)}</div>
        <div class="lesson-title">${esc(lesson.title)}</div>
      </div>

      <div class="sec-label"><span class="num">H</span> ${S.labelHook}</div>
      <section class="card hook">
        <span class="tag-mis">${ICON.warn}${S.hookTag}</span>
        <p class="hook-txt">${mis(lesson).hook}</p>
      </section>

      <div id="segHostTop"></div>

      <div class="sec-label"><span class="num">✓</span> ${S.labelMcq}</div>
      <section class="card" id="mcqCard"></section>

      <div id="segHostRest"></div>

      <div class="sec-label"><span class="num">Σ</span> ${S.labelRecon}</div>
      <section class="card" id="secRecon"></section>

      <div class="foot">${lesson.foot}</div>
    </div>
  </div>`;
}

function mis(lesson: LessonData) {
  return lesson.misconceptions[0];
}

// ---- one animated segment ----
function buildSegment(lesson: LessonData, seg: Segment, onComplete: () => void): Built {
  const card = document.createElement("section");
  card.className = "card seg";
  card.setAttribute("data-seg", seg.id);

  const codeHTML = seg.code
    ? '<div class="code-panel">' +
      seg.code
        .map((line, i) => `<div class="cl-line" data-line="${i}"><span class="ln">${i + 1}</span><span>${hlCode(line)}</span></div>`)
        .join("") +
      "</div>"
    : "";

  const ilHTML = seg.il
    ? `<div class="il-panel"><div class="il-head"><span class="il-badge">${S.ilBadge}</span><span class="il-cap">${S.ilCap}</span></div>` +
      seg.il
        .map(
          (l, i) =>
            `<div class="il-line" data-il="${i}"><span class="il-off">${esc(l.off)}</span><span class="il-op">${esc(l.op)}</span>` +
            (l.arg ? `<span class="il-arg">${esc(l.arg)}</span>` : "") +
            (l.cmt ? `<span class="il-cmt">${esc(l.cmt)}</span>` : "") +
            "</div>",
        )
        .join("") +
      "</div>"
    : "";

  const predictHTML =
    seg.predictAt != null
      ? '<div class="vz-predict" hidden><div class="vz-ptitle"></div><div class="vz-pq"></div>' +
        '<button class="vz-pshow" type="button"><span></span>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13"/><path d="M13 6l6 6-6 6"/></svg></button></div>'
      : "";

  const consoleHTML = seg.console
    ? '<div class="vz-console"><span class="vz-cprompt">›</span><span class="vz-clbl">консоль</span><span class="vz-cout"></span><span class="vz-caret"></span></div>'
    : "";

  card.innerHTML =
    `<div class="seg-head"><span class="seg-num">${esc(seg.num)}</span><div><div class="seg-kicker">${esc(seg.kicker)}</div><div class="seg-title">${esc(seg.title)}</div></div></div>` +
    codeHTML +
    ilHTML +
    `<div class="stage" aria-label="${esc(seg.title)}"></div>` +
    consoleHTML +
    predictHTML +
    '<div class="vz-ctrls">' +
    `<button class="vz-nav vz-prev" type="button" title="${S.back}" aria-label="${S.back}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg></button>` +
    `<button class="vz-play" type="button" title="${S.play}" aria-label="${S.play}"><svg class="vz-playicon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button>` +
    `<button class="vz-nav vz-next" type="button" title="${S.forward}" aria-label="${S.forward}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>` +
    '<div class="vz-steplabel"></div><div class="vz-scrub" role="group" aria-label="Шаги"></div></div>' +
    '<div class="vz-caption"></div>' +
    claimBlock(lesson, seg);

  const q = <T extends HTMLElement = HTMLElement>(sel: string) => card.querySelector<T>(sel);
  const els: VizElements = {
    caption: q(".vz-caption"),
    step: q(".vz-steplabel"),
    scrub: q(".vz-scrub"),
    prev: q<HTMLButtonElement>(".vz-prev"),
    next: q<HTMLButtonElement>(".vz-next"),
    play: q<HTMLButtonElement>(".vz-play"),
    playIcon: card.querySelector<SVGElement>(".vz-playicon"),
    codePanel: seg.code ? q(".code-panel") : null,
    ilPanel: seg.il ? q(".il-panel") : null,
    out: seg.console ? q(".vz-cout") : null,
  };
  if (seg.predictAt != null) {
    els.predict = q(".vz-predict");
    els.predictTitle = q(".vz-ptitle");
    els.predictQ = q(".vz-pq");
    els.predictShow = q<HTMLButtonElement>(".vz-pshow");
    els.predictShowTxt = q(".vz-pshow span");
  }

  const player = new VizPlayer({
    stage: q(".stage")!,
    viewBox: seg.viewBox,
    zones: seg.zones,
    scenes: seg.scenes,
    gateIndex: seg.predictAt,
    predictQ: seg.predictQ,
    vizKey: seg.id,
    els,
    ui: VIZ_UI,
    reducedMotion: REDUCED,
    onStep: (maxIdx, total) => {
      if (maxIdx === total - 1) onComplete();
    },
  });

  for (let i = 0; i < player.total; i++) {
    const s = document.createElement("button");
    s.className = "vz-seg";
    s.type = "button";
    s.setAttribute("aria-label", `${i + 1}/${player.total}`);
    s.addEventListener("click", () => {
      player.pause();
      player.goTo(i);
    });
    els.scrub!.appendChild(s);
  }
  els.prev!.addEventListener("click", () => player.prev());
  els.next!.addEventListener("click", () => {
    player.pause();
    player.next();
  });
  els.play!.addEventListener("click", () => player.toggle());
  els.predictShow?.addEventListener("click", () => {
    player.resolvePredict();
    if (!REDUCED) player.play();
  });

  player.render();
  return { card, viz: player };
}

function claimBlock(lesson: LessonData, seg: Segment): string {
  return (
    '<div class="dd-claim sage">' +
    `<div class="dd-ctitle"><span class="n">↳</span>${esc(S.mechanismTitle)}</div>` +
    `<div class="dd-ctext">${seg.explain}</div>` +
    srcChips(lesson, seg.sources) +
    "</div>"
  );
}

function srcById(lesson: LessonData, id: string): Source | undefined {
  return lesson.sources.find((s) => s.id === id);
}
function srcChips(lesson: LessonData, ids: string[]): string {
  const h = ids
    .map((id) => {
      const s = srcById(lesson, id);
      if (!s) return "";
      return `<a href="${s.url}" target="_blank" rel="noopener" title="${esc(s.title)}">${ICON.book}${esc(s.title)}</a>`;
    })
    .join("");
  return `<div class="dd-src">${h}</div>`;
}

// ---- MCQ + FSRS grade strip ----
function buildMcq(root: HTMLElement, lesson: LessonData, progress: LessonProgress, reporter: LessonReporter): void {
  const card: Card = lesson.cards[0];
  const host = root.querySelector<HTMLElement>("#mcqCard")!;
  const checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

  host.innerHTML =
    `<div class="q-title">${card.question}</div>` +
    '<div class="opts" id="qOpts"></div>' +
    `<button class="q-check" id="qCheck" disabled>${S.check}</button>` +
    '<div class="q-banner" id="qBanner"><div class="q-bhead"><span id="qbIcon"></span><span id="qbTitle"></span><span class="xpp" id="qbXp" hidden></span></div><div class="q-btext" id="qbText"></div></div>' +
    // grade strip (revealed after answering) — this posts the real review
    `<div class="grade" id="grade" hidden><div class="grade-h">${S.gradeHead}</div><div class="grade-row">` +
    gradeBtn(1, S.gradeAgain, S.gradeAgainHint) +
    gradeBtn(2, S.gradeHard, "") +
    gradeBtn(3, S.gradeGood, "") +
    gradeBtn(4, S.gradeEasy, "") +
    `</div><div class="grade-done" id="gradeDone">${ICON.check}<span id="gradeMsg"></span></div></div>`;

  const opts = host.querySelector<HTMLElement>("#qOpts")!;
  const check = host.querySelector<HTMLButtonElement>("#qCheck")!;
  let selected = -1;
  let answered = false;

  card.options.forEach((txt, i) => {
    const b = document.createElement("button");
    b.className = "opt";
    b.type = "button";
    b.setAttribute("data-opt", String(i));
    b.innerHTML = `<span class="mk">${checkSvg}</span><span class="ot">${esc(txt)}</span>`;
    b.addEventListener("click", () => {
      if (answered) return;
      selected = i;
      opts.querySelectorAll(".opt").forEach((o) => o.classList.remove("sel"));
      b.classList.add("sel");
      check.disabled = false;
    });
    opts.appendChild(b);
  });

  check.addEventListener("click", () => {
    if (answered || selected < 0) return;
    answered = true;
    const optEls = opts.querySelectorAll<HTMLElement>(".opt");
    optEls.forEach((o) => o.classList.add("locked"));
    const correct = card.correctIndex;
    const ok = selected === correct;
    optEls[correct].classList.add("correct");
    if (!ok) optEls[selected].classList.add("wrong");

    const banner = host.querySelector<HTMLElement>("#qBanner")!;
    banner.className = "q-banner show " + (ok ? "ok" : "no");
    host.querySelector<HTMLElement>("#qbIcon")!.innerHTML = ok
      ? '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>'
      : '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 8v5M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>';
    host.querySelector<HTMLElement>("#qbTitle")!.textContent = ok ? S.okTitle : S.noTitle;
    host.querySelector<HTMLElement>("#qbText")!.innerHTML = ok ? card.okText : card.noText;
    const xpBadge = host.querySelector<HTMLElement>("#qbXp")!;
    if (ok) {
      xpBadge.hidden = false;
      xpBadge.textContent = "+" + card.xp + " XP";
      progress.addXp(card.xp);
    }
    check.disabled = true;
    progress.bumpTo(Math.max(78, 78));
    tg.notify(ok ? "success" : "warning");

    // reveal the grade strip → this is the review action that moves the schedule.
    const grade = host.querySelector<HTMLElement>("#grade")!;
    grade.hidden = false;
    wireGrade(host, lesson, card, progress, reporter);
    grade.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "nearest" });
  });
}

function gradeBtn(g: Grade, label: string, hint: string): string {
  return `<button class="grade-btn" type="button" data-g="${g}"><span class="gl">${label}</span><span class="gi">${hint || "&nbsp;"}</span></button>`;
}

function wireGrade(
  host: HTMLElement,
  lesson: LessonData,
  card: Card,
  progress: LessonProgress,
  reporter: LessonReporter,
): void {
  const itemId = `${lesson.id}/${card.id}`;
  const done = host.querySelector<HTMLElement>("#gradeDone")!;
  const msg = host.querySelector<HTMLElement>("#gradeMsg")!;
  const buttons = host.querySelectorAll<HTMLButtonElement>(".grade-btn");
  let sent = false;

  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (sent) return;
      sent = true;
      const grade = Number(btn.getAttribute("data-g")) as Grade;
      buttons.forEach((b) => (b.disabled = true));
      btn.classList.add("sel");
      msg.textContent = S.gradeSending;
      done.classList.add("show");
      tg.impact("medium");
      try {
        const res: ReviewResponse = await api.review(session.userId, itemId, grade);
        msg.innerHTML = `<b>${S.reviewSaved(S.reviewDaysFmt(res.intervalDays))}</b>`;
        progress.bumpTo(100);
        // Reaching the grade = the user completed the lesson. Report it (sticky).
        reporter.markCompleted();
        appendNext(host);
        (window as unknown as { __lastReview?: ReviewResponse }).__lastReview = res;
        tg.notify("success");
      } catch (e) {
        sent = false;
        buttons.forEach((b) => (b.disabled = false));
        btn.classList.remove("sel");
        msg.textContent = `Ошибка сохранения: ${(e as Error).message}`;
        done.classList.add("show");
      }
    });
  });
}

function appendNext(host: HTMLElement): void {
  if (host.querySelector("#btnNext")) return;
  const btn = document.createElement("button");
  btn.className = "next-cta";
  btn.id = "btnNext";
  btn.innerHTML = `${S.toHome}${ICON.arrowR}`;
  btn.addEventListener("click", () => void router.showHome());
  host.appendChild(btn);
}

// ---- reconstruct ----
function reconstruct(lesson: LessonData): string {
  const takeaways = lesson.takeaways
    .map(
      (x) =>
        `<div class="rc-row"><span class="rc-ic ${x.icon}">${ICON[x.icon]}</span><div><div class="rc-k">${esc(x.k)}</div><div class="rc-v">${x.v}</div></div></div>`,
    )
    .join("");
  const specSrc = srcById(lesson, lesson.spec[0].source);
  const spec = `<div class="rc-spec">${lesson.spec[0].text} <span class="rc-specsrc">— ${S.specLabel}, ${esc(specSrc?.title ?? "")}</span></div>`;
  const edges =
    `<div class="rc-edges"><div class="rc-edgeh">${S.edgeHead}</div>` +
    lesson.edgeCases.map((e) => `<div class="rc-edge">${e.text}</div>`).join("") +
    "</div>";
  const primary = lesson.sources[0];
  const srcCard = `<a class="src" href="${primary.url}" target="_blank" rel="noopener"><span class="sic">${ICON.book}</span><span class="sm"><span class="sk">${S.sourceKicker}</span><span class="st">${esc(primary.title)}</span></span><span class="go">${ICON.ext}</span></a>`;
  const moreIds = lesson.sources.slice(1).map((s) => s.id);
  const more = moreIds.length ? `<div class="srcmore"><div class="srcmore-h">${S.moreSources}</div>${srcChips(lesson, moreIds)}</div>` : "";
  return takeaways + spec + edges + srcCard + more;
}
