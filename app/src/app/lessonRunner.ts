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
import { ICON, VizPlayer, prefersReducedMotion, whenFontsReady, hlCode, esc } from "../engine/index.ts";
import type { VizElements, VizPlayer as VizPlayerType } from "../engine/index.ts";
import { getLesson } from "../lessons/index.ts";
import type { Card, LessonData, Segment, Source } from "../lessons/types.ts";
import { S } from "../strings.ts";
import { router } from "./router.ts";
import { sessionQueue } from "./sessionQueue.ts";
import { tg } from "../telegram/webapp.ts";

/**
 * Reduced-motion state for the CURRENT lesson render. Refreshed at the start of every
 * `runLesson` (not cached at module load) so the "Меньше движения" toggle in Profile takes
 * effect on the next lesson: `prefersReducedMotion()` now also reads the persisted flag, and
 * the lesson re-renders when reopened. Read by buildSegment / revealGrade during that render.
 */
let REDUCED = prefersReducedMotion();

/**
 * XP the server awards per completed review (Program.cs: `xp = reviewsTotal * 10`). Grading a
 * card IS one completed review, so we surface exactly this at the grade step — a real, server-
 * backed number, never a made-up figure. Keep in sync with the backend XP rule.
 */
const REVIEW_XP = 10;

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
      .reportLessonProgress(this.lessonId, this.maxSeen, this.total, completed)
      .then((res) => {
        (window as unknown as { __lessonProgress?: unknown }).__lessonProgress = res;
      })
      .catch(() => {
        /* swallow — reporting is best-effort telemetry, not part of the loop */
      });
  }
}

export function runLesson(root: HTMLElement, lessonId: string, cardId?: string): void {
  // Refresh the reduced-motion decision for THIS render (OS media | ?reduced=1 | persisted toggle),
  // so flipping "Меньше движения" in Profile silences this lesson's animations on reopen.
  REDUCED = prefersReducedMotion();

  const lesson = getLesson(lessonId);
  if (!lesson) {
    root.innerHTML = `<div class="frame"><div class="lesson-body" style="padding-top:24px"><div class="notice err"><b>${S.errorTitle}</b><br/>Урок «${esc(lessonId)}» не найден.</div><button class="cta" id="back">${S.toHome}</button></div></div>`;
    root.querySelector("#back")?.addEventListener("click", () => void router.showHome());
    return;
  }

  // Render the REQUESTED card (the one the session queue points at), not always cards[0].
  // Fall back to the first card when no id is given (opening a lesson directly for re-view).
  const card: Card = (cardId ? lesson.cards.find((c) => c.id === cardId) : undefined) ?? lesson.cards[0];

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

  // ---- MCQ + grade (closes the loop) ----
  buildMcq(root, lesson, card, progress, reporter);

  // ---- reconstruct + sources ----
  el("#secRecon").innerHTML = reconstruct(lesson);

  // ---- top-bar wiring ----
  el("#btnClose").addEventListener("click", () => {
    tg.impact("light");
    void router.showHome();
  });
  el<HTMLButtonElement>("#btnNext")?.addEventListener("click", () => void router.showHome());

  progress.setPct(6);

  // Build the measuring diagram engine ONLY AFTER the web fonts are ready. The engine
  // sizes every box from measured glyph advances, so measuring before Rubik/Onest/JetBrains
  // Mono load would size boxes in the system fallback (wrong metrics) — the race that broke
  // viz-fit on Linux CI / offline. Fonts are now self-hosted, so this resolves ~immediately;
  // the shell above has already painted. Autoplay + reduced-motion behaviour is unchanged —
  // it just starts one microtask/frame later, after the first sizing sees the real font.
  void whenFontsReady().then(() => {
    // A newer navigation may have replaced the DOM while we awaited fonts; bail if our shell
    // is gone (the #segHostTop we captured is detached), so we never mount into a stale tree.
    if (!hostTop.isConnected) return;
    buildSegmentsAndWire(lesson); // `lesson` is narrowed to LessonData here (after the guard)
  });

  // ---- build animated segments + wire autoplay/headless surface (post-fonts.ready) ----
  const hostTop = el("#segHostTop");
  const hostRest = el("#segHostRest");
  function buildSegmentsAndWire(lesson: LessonData): void {
  const built: Built[] = [];
  lesson.segments.forEach((seg, i) => {
    const b = buildSegment(lesson, seg, () => progress.markSeg(seg.id));
    (i < 2 ? hostTop : hostRest).appendChild(b.card);
    viz().vizByKey[seg.id] = b.viz;
    viz().segments[seg.id] = b.viz.state;
    built.push(b);
  });

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
  } // end buildSegmentsAndWire
}

// ---------------------------------------------------------------------------

function shell(lesson: LessonData): string {
  // The "N из M" session counter shows only during a continuous session (total > 0).
  const sess = sessionQueue.total > 0
    ? `<span class="sess-count" id="sessCount" title="${S.sessionProgressLabel}" aria-label="${S.sessionProgressLabel}">${esc(S.sessionProgress(sessionQueue.position, sessionQueue.total))}</span>`
    : "";
  return `
  <div class="frame screen-enter">
    <header class="lbar">
      <button class="close" id="btnClose" title="${S.close}" aria-label="${S.close}">${ICON.close}</button>
      ${sess}
      <div class="lprog" aria-hidden="true"><i id="lprogFill"></i></div>
      <span class="xp" id="xpChip" title="XP за урок">
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

  // Language-aware chrome: Python lessons highlight Python syntax and label the
  // bytecode panel «dis · байткод» (CPython) instead of «IL» (C# compiler output).
  const lang = lesson.lang ?? "csharp";
  const codeHTML = seg.code
    ? '<div class="code-panel">' +
      seg.code
        .map((line, i) => `<div class="cl-line" data-line="${i}"><span class="ln">${i + 1}</span><span>${hlCode(line, lang)}</span></div>`)
        .join("") +
      "</div>"
    : "";

  const ilHTML = seg.il
    ? `<div class="il-panel"><div class="il-head"><span class="il-badge">${lang === "python" ? S.disBadge : S.ilBadge}</span><span class="il-cap">${lang === "python" ? S.disCap : S.ilCap}</span></div>` +
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
    // The engine renders an SVG (role="img") into .stage; we name it via a <title>
    // element AFTER render (see below), so this container carries no bare aria-label
    // (which would be a prohibited-attr on a role-less div).
    `<div class="stage"></div>` +
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
  // Accessibility: the engine tags its diagram SVG with role="img"; give that SVG an
  // accessible name (a <title> is the SVG-native equivalent of alt text) so it is not
  // an unlabelled image. The individual animated shapes/text inside stay decorative.
  const stageSvg = card.querySelector<SVGSVGElement>(".stage svg");
  if (stageSvg && !stageSvg.querySelector("title")) {
    const titleEl = document.createElementNS("http://www.w3.org/2000/svg", "title");
    titleEl.textContent = seg.title;
    stageSvg.insertBefore(titleEl, stageSvg.firstChild);
    stageSvg.setAttribute("aria-label", seg.title);
  }
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

// ---------------------------------------------------------------------------
// Card question: typed generation (strong recall) OR MCQ fallback (recognition).
//
// A card is a TYPED-ANSWER card iff it is `predict-output` AND carries a non-empty
// `verify.expect` (the real program output). Then the user TYPES the output and it is graded
// objectively by string-compare. Otherwise (compare/explain, or no usable expect) we keep the
// MCQ. Either way the outcome pre-selects the FSRS grade in a shared grade strip.
// ---------------------------------------------------------------------------

/** A card can be typed-graded only if it has a real, non-empty expected output to compare against. */
function isTyped(card: Card): boolean {
  return card.type === "predict-output" && typeof card.verify?.expect === "string" && card.verify.expect.trim().length > 0;
}

/**
 * Tolerant normalization for objective typed-answer grading. Program output should match by
 * VALUE, not by incidental whitespace: normalize CRLF/CR -> LF, strip trailing spaces on each
 * line, and trim leading/trailing blank lines. Inner structure (line breaks that carry meaning)
 * is preserved. This mirrors what the authoring `run-csharp` gate compares against (stdout.trim()).
 */
function normOutput(s: string): string {
  return s
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/^\n+/, "")
    .replace(/\n+$/, "");
}

/** Objective correctness of a typed answer against the card's real expected output. */
function typedCorrect(card: Card, typed: string): boolean {
  return normOutput(typed) === normOutput(card.verify.expect);
}

const OK_ICON =
  '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
const NO_ICON =
  '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 8v5M12 16h.01"/><circle cx="12" cy="12" r="9"/></svg>';

/** The confidence ("уверен?") strip, captured BEFORE reveal. Returns a getter for the tap. */
function calibrationStrip(): string {
  return (
    '<div class="calib" id="calib"><div class="calib-q">' + esc(S.confidenceQ) + "</div>" +
    '<div class="calib-row">' +
    `<button class="calib-btn" type="button" data-conf="1">${OK_ICON}<span>${esc(S.confidenceYes)}</span></button>` +
    `<button class="calib-btn" type="button" data-conf="0"><span>${esc(S.confidenceNo)}</span></button>` +
    "</div></div>"
  );
}

/** Wire the confidence taps; returns () => boolean|null (null = the user never answered). */
function wireCalibration(host: HTMLElement): () => boolean | null {
  let confidence: boolean | null = null;
  const btns = host.querySelectorAll<HTMLButtonElement>(".calib-btn");
  btns.forEach((b) => {
    b.addEventListener("click", () => {
      confidence = b.getAttribute("data-conf") === "1";
      btns.forEach((o) => o.classList.remove("sel"));
      b.classList.add("sel");
      tg.impact("light");
      (window as unknown as { __calibration?: { confidence: boolean | null } }).__calibration = { confidence };
    });
  });
  return () => confidence;
}

/** Immediate, tasteful calibration feedback line (no shaming). */
function calibrationMessage(correct: boolean, confidence: boolean | null): string {
  if (confidence === null) return "";
  if (correct) return confidence ? S.calibRightSure : S.calibRightUnsure;
  return confidence ? S.calibWrongSure : S.calibWrongUnsure;
}

// ---- card dispatcher ----
function buildMcq(root: HTMLElement, lesson: LessonData, card: Card, progress: LessonProgress, reporter: LessonReporter): void {
  const host = root.querySelector<HTMLElement>("#mcqCard")!;
  if (isTyped(card)) buildTyped(host, lesson, card, progress, reporter);
  else buildOptions(host, lesson, card, progress, reporter);
}

/**
 * TYPED-ANSWER card (generation, not recognition): a monospace text input. On submit the typed
 * text is normalized and compared to the real `verify.expect` -> OBJECTIVE correct/incorrect. The
 * correct output is revealed; on a miss we show a "yours vs expected" highlighted diff. The
 * objective verdict then PRE-SELECTS the FSRS grade (correct -> Good, wrong -> Again).
 */
function buildTyped(
  host: HTMLElement,
  lesson: LessonData,
  card: Card,
  progress: LessonProgress,
  reporter: LessonReporter,
): void {
  host.innerHTML =
    `<div class="q-title">${card.question}</div>` +
    `<div class="typed"><div class="typed-lbl"><span class="typed-badge">${esc(S.typedLabel)}</span><span class="typed-hint">${esc(S.typedHint)}</span></div>` +
    `<textarea class="typed-in" id="qTyped" rows="1" spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" placeholder="${esc(S.typedPlaceholder)}" aria-label="${esc(S.typedLabel)}"></textarea></div>` +
    calibrationStrip() +
    `<button class="q-check" id="qCheck" disabled>${S.typedCheck}</button>` +
    '<div class="q-banner" id="qBanner"><div class="q-bhead"><span id="qbIcon"></span><span id="qbTitle"></span><span class="xpp" id="qbXp" hidden></span></div>' +
    '<div class="typed-verdict" id="qVerdict" hidden></div>' +
    '<div class="q-btext" id="qbText"></div></div>' +
    gradeStripHtml();

  const input = host.querySelector<HTMLTextAreaElement>("#qTyped")!;
  const check = host.querySelector<HTMLButtonElement>("#qCheck")!;
  const getConfidence = wireCalibration(host);
  let answered = false;

  // enable the check as soon as the user has typed something
  input.addEventListener("input", () => {
    check.disabled = answered || input.value.length === 0;
  });
  // Ctrl/Cmd+Enter submits (Enter alone inserts a newline — output can be multi-line).
  input.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !check.disabled) check.click();
  });

  check.addEventListener("click", () => {
    if (answered || input.value.length === 0) return;
    answered = true;
    input.readOnly = true;
    input.classList.add("locked");
    const ok = typedCorrect(card, input.value);
    input.classList.add(ok ? "ok" : "no");
    check.disabled = true;
    check.classList.add("answered"); // remove the now-dead check button (verdict + grade take over)

    const banner = host.querySelector<HTMLElement>("#qBanner")!;
    banner.className = "q-banner show " + (ok ? "ok" : "no");
    host.querySelector<HTMLElement>("#qbIcon")!.innerHTML = ok ? OK_ICON : NO_ICON;
    host.querySelector<HTMLElement>("#qbTitle")!.textContent = ok ? S.verdictOk : S.verdictNo;

    // reveal: correct output always; on a miss also a yours-vs-expected diff.
    const verdict = host.querySelector<HTMLElement>("#qVerdict")!;
    verdict.hidden = false;
    verdict.innerHTML = typedReveal(card, input.value, ok);

    const conf = getConfidence();
    const calibLine = calibrationMessage(ok, conf);
    host.querySelector<HTMLElement>("#qbText")!.innerHTML =
      (ok ? card.okText : card.noText) + (calibLine ? `<div class="calib-fb ${conf === (ok) ? "good" : "warn"}">${esc(calibLine)}</div>` : "");

    const xpBadge = host.querySelector<HTMLElement>("#qbXp")!;
    if (ok) {
      xpBadge.hidden = false;
      xpBadge.textContent = "+" + card.xp + " XP";
      progress.addXp(card.xp);
    }
    // lock the confidence strip once answered
    host.querySelectorAll<HTMLButtonElement>(".calib-btn").forEach((b) => (b.disabled = true));

    progress.bumpTo(78);
    tg.notify(ok ? "success" : "error"); // correct -> success, wrong -> error (per spec)

    (window as unknown as { __lastAnswer?: unknown }).__lastAnswer = {
      itemId: `${lesson.id}/${card.id}`,
      typed: input.value,
      expected: card.verify.expect,
      correct: ok,
      confidence: conf,
    };

    revealGrade(host, lesson, card, progress, reporter, { correct: ok, confidence: conf });
  });
}

/**
 * MCQ FALLBACK (recognition) for cards WITHOUT a usable typed expect (compare/explain). Same
 * pre-select-the-grade contract: a correct pick -> Good, a wrong pick -> Again.
 */
function buildOptions(
  host: HTMLElement,
  lesson: LessonData,
  card: Card,
  progress: LessonProgress,
  reporter: LessonReporter,
): void {
  host.innerHTML =
    `<div class="q-title">${card.question}</div>` +
    '<div class="opts" id="qOpts"></div>' +
    calibrationStrip() +
    `<button class="q-check" id="qCheck" disabled>${S.check}</button>` +
    '<div class="q-banner" id="qBanner"><div class="q-bhead"><span id="qbIcon"></span><span id="qbTitle"></span><span class="xpp" id="qbXp" hidden></span></div><div class="q-btext" id="qbText"></div></div>' +
    gradeStripHtml();

  const opts = host.querySelector<HTMLElement>("#qOpts")!;
  const check = host.querySelector<HTMLButtonElement>("#qCheck")!;
  const getConfidence = wireCalibration(host);
  let selected = -1;
  let answered = false;

  card.options.forEach((txt, i) => {
    const b = document.createElement("button");
    b.className = "opt";
    b.type = "button";
    b.setAttribute("data-opt", String(i));
    b.innerHTML = `<span class="mk">${OK_ICON}</span><span class="ot">${esc(txt)}</span>`;
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
    host.querySelector<HTMLElement>("#qbIcon")!.innerHTML = ok ? OK_ICON : NO_ICON;
    host.querySelector<HTMLElement>("#qbTitle")!.textContent = ok ? S.okTitle : S.noTitle;

    const conf = getConfidence();
    const calibLine = calibrationMessage(ok, conf);
    host.querySelector<HTMLElement>("#qbText")!.innerHTML =
      (ok ? card.okText : card.noText) + (calibLine ? `<div class="calib-fb ${conf === ok ? "good" : "warn"}">${esc(calibLine)}</div>` : "");

    const xpBadge = host.querySelector<HTMLElement>("#qbXp")!;
    if (ok) {
      xpBadge.hidden = false;
      xpBadge.textContent = "+" + card.xp + " XP";
      progress.addXp(card.xp);
    }
    host.querySelectorAll<HTMLButtonElement>(".calib-btn").forEach((b) => (b.disabled = true));
    check.disabled = true;
    check.classList.add("answered"); // remove the now-dead check button (verdict + grade take over)
    progress.bumpTo(78);
    tg.notify(ok ? "success" : "error"); // correct -> success, wrong -> error (per spec)

    (window as unknown as { __lastAnswer?: unknown }).__lastAnswer = {
      itemId: `${lesson.id}/${card.id}`,
      correct: ok,
      confidence: conf,
    };

    revealGrade(host, lesson, card, progress, reporter, { correct: ok, confidence: conf });
  });
}

/**
 * Reveal after a typed submit: always the correct output; on a miss also a compact
 * "yours vs expected" comparison so the user sees exactly where they diverged.
 */
function typedReveal(card: Card, typed: string, ok: boolean): string {
  const expected = `<div class="tv-row expected"><span class="tv-k">${esc(S.typedExpected)}</span><pre class="tv-v">${esc(normOutput(card.verify.expect))}</pre></div>`;
  if (ok) return expected;
  const yours = `<div class="tv-row yours"><span class="tv-k">${esc(S.typedYours)}</span><pre class="tv-v">${esc(normOutput(typed))}</pre></div>`;
  return `<div class="tv-hint">${esc(S.typedRevealHint)}</div>${yours}${expected}`;
}

// ---- shared FSRS grade strip (the review action that moves the schedule) ----

function gradeStripHtml(): string {
  return (
    `<div class="grade" id="grade" hidden><div class="grade-h" id="gradeHead">${S.gradeHeadObjective}</div>` +
    '<div class="grade-preselect" id="gradePreselect" hidden></div>' +
    '<div class="grade-row">' +
    gradeBtn(1, S.gradeAgain, S.gradeAgainHint) +
    gradeBtn(2, S.gradeHard, "") +
    gradeBtn(3, S.gradeGood, "") +
    gradeBtn(4, S.gradeEasy, "") +
    `</div>` +
    // success line: green check + saved message + a "+N XP" burst for the completed review
    // (the review is exactly what the server rewards with REVIEW_XP; honest, not fabricated).
    `<div class="grade-done" id="gradeDone"><span class="gd-ok" id="gradeOk">${ICON.check}</span><span id="gradeMsg"></span><span class="grade-xp" id="gradeXp" hidden>+${REVIEW_XP} ${S.xpUnit}</span></div>` +
    // failure line: friendly, NO success check; kept separate so a save error never reads as success
    `<div class="grade-fail" id="gradeFail" hidden><div class="gf-h">${ICON.warn}<b>${S.reviewFailTitle}</b></div><div class="gf-b">${S.reviewFailBody}</div></div>` +
    `</div>`
  );
}

function gradeBtn(g: Grade, label: string, hint: string): string {
  return `<button class="grade-btn" type="button" data-g="${g}"><span class="gl">${label}</span><span class="gi">${hint || "&nbsp;"}</span></button>`;
}

/**
 * Reveal the grade strip with the objective outcome PRE-SELECTED: correct -> Good (3), wrong ->
 * Again (1). The self-rating is now secondary — the user MAY bump to Hard/Easy, but the objective
 * result is the primary signal. The chosen grade is posted to /api/review exactly as before, plus
 * the optional calibration fields (correct + confidence).
 */
function revealGrade(
  host: HTMLElement,
  lesson: LessonData,
  card: Card,
  progress: LessonProgress,
  reporter: LessonReporter,
  outcome: { correct: boolean; confidence: boolean | null },
): void {
  const grade = host.querySelector<HTMLElement>("#grade")!;
  grade.hidden = false;
  const preselected: Grade = outcome.correct ? 3 : 1; // Good | Again
  const buttons = host.querySelectorAll<HTMLButtonElement>(".grade-btn");
  buttons.forEach((b) => {
    if (Number(b.getAttribute("data-g")) === preselected) b.classList.add("preselected");
  });
  const banner = host.querySelector<HTMLElement>("#gradePreselect")!;
  banner.hidden = false;
  banner.className = "grade-preselect show " + (outcome.correct ? "ok" : "no");
  banner.textContent = outcome.correct ? S.gradePreselectedOk : S.gradePreselectedNo;

  wireGrade(host, lesson, card, progress, reporter, preselected, outcome);
  grade.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "nearest" });
}

function wireGrade(
  host: HTMLElement,
  lesson: LessonData,
  card: Card,
  progress: LessonProgress,
  reporter: LessonReporter,
  preselected: Grade,
  outcome: { correct: boolean; confidence: boolean | null },
): void {
  const itemId = `${lesson.id}/${card.id}`;
  const done = host.querySelector<HTMLElement>("#gradeDone")!;
  const okMark = host.querySelector<HTMLElement>("#gradeOk")!;
  const fail = host.querySelector<HTMLElement>("#gradeFail")!;
  const msg = host.querySelector<HTMLElement>("#gradeMsg")!;
  const buttons = host.querySelectorAll<HTMLButtonElement>(".grade-btn");
  let sent = false;

  async function post(grade: Grade, btn: HTMLButtonElement): Promise<void> {
    if (sent) return;
    sent = true;
    // enter "sending": hide any prior failure, show the success line with the sending message.
    fail.hidden = true;
    okMark.hidden = false;
    buttons.forEach((b) => {
      b.disabled = true;
      b.classList.remove("sel");
    });
    btn.classList.add("sel");
    msg.textContent = S.gradeSending;
    done.classList.add("show");
    tg.impact("medium");
    try {
      // Objective correctness + the confidence tap ride along as OPTIONAL calibration fields.
      const res: ReviewResponse = await api.review(itemId, grade, {
        correct: outcome.correct,
        confidence: outcome.confidence ?? undefined,
      });
      msg.innerHTML = `<b>${S.reviewSaved(S.reviewDaysFmt(res.intervalDays))}</b>`;
      progress.bumpTo(100);
      // "+N XP" burst for the completed review — reveal it and play the existing xpBump animation
      // (reduced-motion-safe: the class-driven animation is disabled by the reduced-motion CSS).
      const xpBurst = host.querySelector<HTMLElement>("#gradeXp");
      if (xpBurst) {
        xpBurst.hidden = false;
        xpBurst.classList.remove("bump");
        void xpBurst.offsetWidth; // restart the animation
        xpBurst.classList.add("bump");
      }
      // Reaching the grade = the user completed the lesson. Report it (sticky).
      reporter.markCompleted();
      // Honest same-session return (AUTHORING-AI §3: a missed card comes back this session —
      // the FSRS ~1-min learning step): grade AGAIN re-queues the card at the session's end
      // (once per card, see sessionQueue). Done BEFORE the next-action buttons are built so
      // the primary CTA and the "N из M" counter reflect the grown queue immediately.
      if (
        grade === 1 &&
        sessionQueue.current &&
        `${sessionQueue.current.lessonId}/${sessionQueue.current.cardId}` === itemId &&
        sessionQueue.requeueCurrent()
      ) {
        const sc = document.querySelector("#sessCount");
        if (sc) sc.textContent = S.sessionProgress(sessionQueue.position, sessionQueue.total);
      }
      appendNext(host);
      (window as unknown as { __lastReview?: ReviewResponse }).__lastReview = res;
      tg.notify("success");
    } catch (e) {
      // Save failed: do NOT show the success check or leak the raw error. Show a friendly
      // failure line and re-enable the grade buttons so the same tap retries (retry already works).
      void e;
      sent = false;
      buttons.forEach((b) => (b.disabled = false));
      btn.classList.remove("sel");
      done.classList.remove("show");
      okMark.hidden = true;
      msg.textContent = "";
      fail.hidden = false;
      tg.notify("error");
      (window as unknown as { __lastReviewError?: boolean }).__lastReviewError = true;
    }
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const grade = Number(btn.getAttribute("data-g")) as Grade;
      void post(grade, btn);
    });
  });

  void preselected; // pre-selection is purely visual; the user confirms by tapping a grade.
}

/**
 * Post-grade action area. In a continuous session with cards remaining, the PRIMARY action
 * advances to the next due card ("Следующая карточка") and "На главную" is a secondary link.
 * On the last card of the session (or outside a session) the primary action closes the session
 * and returns home — where the drained due queue makes "День закрыт"/empty states appear.
 */
function appendNext(host: HTMLElement): void {
  if (host.querySelector("#btnNext")) return;
  const wrap = document.createElement("div");
  wrap.className = "next-wrap";

  const hasNext = sessionQueue.active && sessionQueue.position < sessionQueue.total;
  const primary = document.createElement("button");
  primary.className = "next-cta";
  primary.id = "btnNext";
  if (hasNext) {
    primary.innerHTML = `${S.sessionNext}${ICON.arrowR}`;
    primary.addEventListener("click", () => router.advanceSession());
    // secondary escape to home (ends the session)
    const home = document.createElement("button");
    home.className = "next-home";
    home.id = "btnHome";
    home.type = "button";
    home.textContent = S.toHome;
    home.addEventListener("click", () => void router.showHome());
    wrap.appendChild(primary);
    wrap.appendChild(home);
  } else {
    // last card of the session (or no session) -> finish and go home
    primary.innerHTML = `${sessionQueue.total > 0 ? S.sessionFinish : S.toHome}${ICON.arrowR}`;
    primary.addEventListener("click", () => {
      if (sessionQueue.total > 0) router.advanceSession();
      else void router.showHome();
    });
    wrap.appendChild(primary);
  }
  host.appendChild(wrap);
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
  const srcCard = `<a class="src" href="${primary.url}" target="_blank" rel="noopener"><span class="sic">${ICON.book}</span><span class="sm"><span class="sk">${esc(S.sourceKicker(primary.org))}</span><span class="st">${esc(primary.title)}</span></span><span class="go">${ICON.ext}</span></a>`;
  const moreIds = lesson.sources.slice(1).map((s) => s.id);
  const more = moreIds.length ? `<div class="srcmore"><div class="srcmore-h">${S.moreSources}</div>${srcChips(lesson, moreIds)}</div>` : "";
  return takeaways + spec + edges + srcCard + more;
}
