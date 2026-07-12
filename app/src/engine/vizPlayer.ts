/**
 * VizPlayer — configurable DOM adapter for the living-diagram engine.
 * One implementation drives EVERY segment animation across all lessons:
 * it mounts an SVG stage, applies data-join results (enter/update/exit),
 * runs FLIP + accent flashes via WAAPI, syncs the code/IL/console/caption/
 * scrubber UI, gates on a predict-then-run step, and autoplays on demand.
 */
import { baseXY, domMeasure, durations, svgEl, SVGNS, type Durations } from "./dom.ts";
import { layoutScene } from "./layout.ts";
import { StepPlayer } from "./stepPlayer.ts";
import type { DiffResult, FlipMove, Scene, VNode, Zone } from "./types.ts";

export interface VizElements {
  caption?: HTMLElement | null;
  step?: HTMLElement | null;
  scrub?: HTMLElement | null;
  prev?: HTMLButtonElement | null;
  next?: HTMLButtonElement | null;
  play?: HTMLButtonElement | null;
  playIcon?: SVGElement | null;
  codePanel?: HTMLElement | null;
  ilPanel?: HTMLElement | null;
  out?: HTMLElement | null;
  predict?: HTMLElement | null;
  predictTitle?: HTMLElement | null;
  predictQ?: HTMLElement | null;
  predictShow?: HTMLButtonElement | null;
  predictShowTxt?: HTMLElement | null;
}

export interface VizUi {
  stepFmt: (n: number, t: number) => string;
  predictTitle: string;
  predictShow: string;
  play: string;
  pause: string;
}

export interface VizConfig {
  stage: HTMLElement;
  viewBox: string;
  zones?: Zone[];
  scenes: Scene[];
  gateIndex?: number;
  predictQ?: string;
  vizKey?: string;
  els: VizElements;
  ui: VizUi;
  reducedMotion: boolean;
  onStep?: (maxIndex: number, total: number) => void;
}

export interface VizState {
  index: number;
  total: number;
  predictAt: number;
  predictResolved: boolean;
  played: boolean;
}

const PLAY_ICON = '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>';
const PAUSE_ICON = '<path d="M8 5v14l11-7z"/>';

export class VizPlayer {
  readonly cfg: VizConfig;
  readonly K: string;
  readonly total: number;
  readonly state: VizState;

  private stage!: HTMLElement;
  private markerId: string;
  private gateIndex: number;
  private reduced: boolean;
  private dur: Durations;
  private player: StepPlayer;

  private edgeLayer!: SVGGElement;
  private nodeLayer!: SVGGElement;

  private elMap: Record<string, SVGElement> = {};
  private baseMap: Record<string, { x: number; y: number }> = {};
  private vmap: Record<string, VNode> = {};

  private playing = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  predictResolved = false;
  private maxIndex = 0;

  constructor(cfg: VizConfig) {
    this.cfg = cfg;
    this.K = cfg.vizKey || "";
    this.markerId = "vz-arrow" + this.K;
    this.gateIndex = cfg.gateIndex == null ? Infinity : cfg.gateIndex;
    this.reduced = cfg.reducedMotion;
    this.dur = durations(this.reduced);

    // AUTO-LAYOUT v2: resolve each scene's structural placement (`at`) into concrete
    // x/y/w/h BEFORE the StepPlayer renders, so FLIP measures deltas from real
    // coordinates and a node whose `at` changes between scenes still animates its
    // move. layoutScene is pure + deterministic; scenes with explicit x/y (the
    // un-migrated lessons) pass through unchanged (escape hatch). The arrow marker
    // is injected on the laid-out copy.
    const zones = cfg.zones || [];
    const steps = cfg.scenes.map((s) => {
      const laid = layoutScene(s, zones, domMeasure, cfg.viewBox);
      laid._marker = "url(#" + this.markerId + ")";
      return laid;
    });
    this.player = new StepPlayer(steps, { reducedMotion: this.reduced, measure: domMeasure });
    this.total = this.player.steps.length;
    this.state = { index: 0, total: this.total, predictAt: this.gateIndex, predictResolved: false, played: false };

    this.buildSVG();
  }

  private buildSVG(): void {
    const svg = document.createElementNS(SVGNS, "svg") as SVGSVGElement;
    svg.setAttribute("viewBox", this.cfg.viewBox);
    svg.setAttribute("role", "img");
    // Crisp orthogonal strokes + scale-to-fit without distorting the grid.
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.setAttribute("shape-rendering", "geometricPrecision");

    const defs = document.createElementNS(SVGNS, "defs");
    // refX=5.2 lands the arrowhead TIP on the target border (the path already
    // ends exactly on the border; nudge the marker so its tip, not its base, sits
    // there and the 1.5u box stroke isn't pierced).
    defs.innerHTML =
      '<marker id="' +
      this.markerId +
      '" markerWidth="9" markerHeight="9" refX="5.2" refY="3" orient="auto" markerUnits="userSpaceOnUse">' +
      '<path d="M0,0 L6,3 L0,6 Z" fill="#C43D28"/></marker>';
    svg.appendChild(defs);

    const chrome = document.createElementNS(SVGNS, "g");
    chrome.setAttribute("class", "vz-chrome");
    let html = "";
    const zones = this.cfg.zones || [];
    for (const z of zones) {
      html += '<rect class="' + z.cls + '" x="' + z.x + '" y="' + z.y + '" width="' + z.w + '" height="' + z.h + '" rx="12"/>';
      html += '<text class="' + z.labelCls + '" x="' + z.lx + '" y="' + z.ly + '" text-anchor="middle">' + z.label + "</text>";
      if (z.sub) {
        const subY = z.subY != null ? z.subY : z.y + 14;
        html += '<text class="' + (z.subCls || "vz-zsub") + '" x="' + z.lx + '" y="' + subY + '" text-anchor="middle">' + z.sub + "</text>";
      }
    }
    chrome.innerHTML = html;
    svg.appendChild(chrome);

    this.edgeLayer = document.createElementNS(SVGNS, "g") as SVGGElement;
    this.edgeLayer.setAttribute("class", "vz-layer edges");
    this.nodeLayer = document.createElementNS(SVGNS, "g") as SVGGElement;
    this.nodeLayer.setAttribute("class", "vz-layer nodes");
    svg.appendChild(this.edgeLayer);
    svg.appendChild(this.nodeLayer);

    this.stage = this.cfg.stage;
    this.stage.appendChild(svg);
  }

  private layerFor(key: string): SVGGElement {
    return key.charAt(0) === "e" ? this.edgeLayer : this.nodeLayer;
  }

  /**
   * Apply one scene transition in OVERLAP-SAFE STAGES: exit → move → enter.
   *
   * The mid-FLIP overlap bug came from firing all three at t=0: a box entering at its
   * final cell scaled in ON TOP of a box that was still exiting / travelling through
   * that cell (e.g. s4 eval→n swap; s6 boxes vs the gen-0 gate). We now serialise them:
   *   - exit  [0 .. exit]              — leaving nodes fade FAST and are removed;
   *   - move  [moveDelay .. +flip]     — FLIP nodes hold their OLD position until exits
   *                                       have cleared the cells, then travel by transform;
   *   - enter [enterDelay .. +enter]   — arriving nodes stay INVISIBLE until the moves have
   *                                       (mostly) landed, then fade/scale in ON their final
   *                                       spot — never over a box still occupying it.
   * Every stage keeps its final visual via WAAPI fill, and reduced-motion (all durations 0)
   * collapses to the instant final frame unchanged.
   */
  private applyTree(vtree: VNode, d: DiffResult, flip: FlipMove[]): void {
    const movingKeys = new Set(flip.map((m) => m.key));

    // ---- STAGE 1: exits (fast, immediate) ----
    for (const key of d.exit) {
      const el = this.elMap[key];
      if (el) {
        if (this.dur.exit > 0) {
          const an = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: this.dur.exit, easing: "ease", fill: "forwards" });
          an.onfinish = () => {
            if (el.parentNode) el.parentNode.removeChild(el);
          };
        } else if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      }
      delete this.elMap[key];
      delete this.baseMap[key];
      delete this.vmap[key];
    }

    // ---- mount/patch enters + updates (enters mounted INVISIBLE for stage 3) ----
    const children = vtree.children || [];
    const freshEnters: { elm: SVGElement; vc: VNode }[] = [];
    for (const vc of children) {
      const key = vc.key;
      let elm = this.elMap[key];
      const b = baseXY(vc);
      if (!elm) {
        elm = svgEl(vc);
        // Hold new nodes hidden until the enter stage begins, so they never flash at
        // full opacity over a still-clearing cell during exit/move.
        if (!this.reduced && this.dur.enter > 0) elm.style.opacity = "0";
        this.layerFor(key).appendChild(elm);
        this.elMap[key] = elm;
        freshEnters.push({ elm, vc });
      } else {
        const prevVc = this.vmap[key];
        this.patch(elm, vc, prevVc);
        // SIZE-FLIP: when a persisting node's BOX changes size (e.g. a slot value widens
        // its rect), the patched rect jumps to full size instantly. If a neighbour must
        // shift to make room, the grown box would poke into it for the frames before the
        // neighbour's move lands. Animate the rect from its OLD box → new box so the
        // growth is synchronised with the neighbour's FLIP move (no transient overlap).
        if (!this.reduced && this.dur.flip > 0) this.sizeFlip(elm, prevVc, vc);
      }
      this.baseMap[key] = b;
      this.vmap[key] = vc;
    }

    // ---- STAGE 2: FLIP moves ----
    // moveDelay is ONLY needed to let EXITS vacate a destination cell before a mover
    // arrives. With no exits this frame, holding movers back would instead let a
    // simultaneously-RESIZED update node (its rect width is patched instantly) poke into
    // a neighbour that hasn't started shifting yet — so we start moves at t=0 and let the
    // grown box + the neighbour's shift interpolate together (no crossing).
    const moveDelay = d.exit.length > 0 ? this.dur.moveDelay : 0;
    if (!this.reduced) {
      const bows = this.bowsForCrossingMoves(flip);
      for (const mv of flip) {
        const g = this.elMap[mv.key];
        if (!g) continue;
        const bb = this.baseMap[mv.key];
        const bow = bows.get(mv.key);
        const frames = bow
          ? [
              // Bow a swapping mover perpendicular to its travel at mid-flight so two
              // boxes exchanging cells arc AROUND each other instead of passing THROUGH
              // (which read as "two boxes in one cell"). Ends land exactly on target.
              { transform: `translate(${bb.x + mv.dx}px,${bb.y + mv.dy}px)`, offset: 0 },
              { transform: `translate(${bb.x + mv.dx / 2 + bow.x}px,${bb.y + mv.dy / 2 + bow.y}px)`, offset: 0.5 },
              { transform: `translate(${bb.x}px,${bb.y}px)`, offset: 1 },
            ]
          : [
              { transform: `translate(${bb.x + mv.dx}px,${bb.y + mv.dy}px)` },
              { transform: `translate(${bb.x}px,${bb.y}px)` },
            ];
        g.animate(frames, {
          duration: this.dur.flip,
          delay: moveDelay,
          // Hold the OLD position during the pre-move delay and the FINAL position after,
          // so a mover never jumps ahead of an exit vacating its destination.
          fill: "both",
          easing: "cubic-bezier(.2,.7,.2,1)",
        });
      }
    }

    // ---- STAGE 3: enters (delayed until moves land) ----
    // How long the arriving nodes must wait: if nothing leaves AND nothing moves this
    // frame (e.g. the very first frame of a segment, or a pure additive step), enter
    // IMMEDIATELY; if only exits happen, wait for them to clear; if anything moves, wait
    // for the moves to land. This keeps simple/first frames snappy and hard cases safe.
    const hasExit = d.exit.length > 0;
    const hasMove = movingKeys.size > 0;
    const enterDelay = hasMove ? this.dur.enterDelay : hasExit ? this.dur.exit : 0;
    for (const { elm, vc } of freshEnters) this.enterAnim(elm, vc, enterDelay);
  }

  private enterAnim(elm: SVGElement, vc: VNode, delay: number): void {
    if (this.dur.enter <= 0) {
      elm.style.removeProperty("opacity");
      return;
    }
    const b = baseXY(vc);
    const done = () => elm.style.removeProperty("opacity");
    if (vc.key.charAt(0) === "e") {
      const an = elm.animate([{ opacity: 0 }, { opacity: 1 }], { duration: this.dur.enter, delay, easing: "ease", fill: "both" });
      an.onfinish = done;
    } else {
      const an = elm.animate(
        [
          { opacity: 0, transform: `translate(${b.x}px,${b.y}px) scale(.62)` },
          { opacity: 1, transform: `translate(${b.x}px,${b.y}px) scale(1)` },
        ],
        { duration: this.dur.enter, delay, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" },
      );
      an.onfinish = done;
    }
  }

  /**
   * Detect FLIP movers that would CROSS (swap cells) and assign each such mover a
   * perpendicular "bow" vector so the pair arcs around one another instead of passing
   * straight through (which reads as two boxes momentarily stacked in one cell — the
   * async-await s4 done↔cont swap). Two movers collide when, at the transition MIDPOINT,
   * their boxes overlap on both axes. We bow the LATER mover (by key order) away from the
   * shared centre, perpendicular to its dominant travel axis, by half its box extent + a
   * gutter — enough to fully clear. Returns key → {x,y} bow offset (empty when no swaps).
   */
  private bowsForCrossingMoves(flip: FlipMove[]): Map<string, { x: number; y: number }> {
    const bows = new Map<string, { x: number; y: number }>();
    if (flip.length < 2) return bows;
    // Geometry of each mover at start (old) and end (new) centre, plus half-extents.
    const geo = new Map<string, { sx: number; sy: number; ex: number; ey: number; hw: number; hh: number }>();
    for (const mv of flip) {
      const bb = this.baseMap[mv.key];
      const rect = this.elMap[mv.key]?.querySelector("rect");
      if (!bb || !rect) continue;
      const w = parseFloat(rect.getAttribute("width") || "0");
      const h = parseFloat(rect.getAttribute("height") || "0");
      geo.set(mv.key, { sx: bb.x + mv.dx, sy: bb.y + mv.dy, ex: bb.x, ey: bb.y, hw: w / 2, hh: h / 2 });
    }
    const mid = (a: number, b: number) => (a + b) / 2;
    for (let i = 0; i < flip.length; i++) {
      for (let j = i + 1; j < flip.length; j++) {
        const a = geo.get(flip[i].key);
        const b = geo.get(flip[j].key);
        if (!a || !b) continue;
        // NESTING EXEMPT: if either box (at its END position) contains the other, they are
        // a parent↔nested-child pair that translates together — never a swap. Skip.
        const aContainsB = a.hw >= b.hw && a.hh >= b.hh && Math.abs(a.ex - b.ex) <= a.hw - b.hw + 2 && Math.abs(a.ey - b.ey) <= a.hh - b.hh + 2;
        const bContainsA = b.hw >= a.hw && b.hh >= a.hh && Math.abs(b.ex - a.ex) <= b.hw - a.hw + 2 && Math.abs(b.ey - a.ey) <= b.hh - a.hh + 2;
        if (aContainsB || bContainsA) continue;
        // Boxes at the midpoint of the move.
        const amx = mid(a.sx, a.ex);
        const amy = mid(a.sy, a.ey);
        const bmx = mid(b.sx, b.ex);
        const bmy = mid(b.sy, b.ey);
        const ox = a.hw + b.hw - Math.abs(amx - bmx);
        const oy = a.hh + b.hh - Math.abs(amy - bmy);
        if (ox > 1 && oy > 1) {
          // They overlap mid-flight → bow BOTH movers in OPPOSITE perpendicular directions
          // so they arc symmetrically apart (each carries half the needed clearance, and no
          // tail collision as they rejoin the line). Bow axis ⟂ the pair's dominant travel.
          const adx = a.ex - a.sx;
          const ady = a.ey - a.sy;
          const bdx = b.ex - b.sx;
          const bdy = b.ey - b.sy;
          const horizontal = Math.abs(adx) + Math.abs(bdx) >= Math.abs(ady) + Math.abs(bdy);
          // Clearance so the two bowed boxes just separate at mid-flight, split evenly.
          const clearH = (a.hh + b.hh + 10) / 2;
          const clearW = (a.hw + b.hw + 10) / 2;
          if (horizontal) {
            bows.set(flip[i].key, { x: 0, y: -clearH });
            bows.set(flip[j].key, { x: 0, y: +clearH });
          } else {
            bows.set(flip[i].key, { x: -clearW, y: 0 });
            bows.set(flip[j].key, { x: +clearW, y: 0 });
          }
        }
      }
    }
    return bows;
  }

  /** The box `rect` child of a node VNode (key "bx"), or null. */
  private rectVNode(vc: VNode | undefined): VNode | null {
    if (!vc || !vc.children) return null;
    for (const c of vc.children) if (c.key === "bx" && c.tag === "rect") return c;
    return null;
  }

  /**
   * Animate a persisting node's rect from its OLD box to its NEW box when the size (or
   * rect origin) changed, over the FLIP duration. Because the rect is patched to the new
   * geometry synchronously, we set it BACK to the old geometry as the animation's start
   * keyframe and let WAAPI interpolate to the patched (new) values — so a widening slot
   * grows in lockstep with its neighbour's shift instead of jumping wide instantly.
   */
  private sizeFlip(elm: SVGElement, prevVc: VNode | undefined, vc: VNode): void {
    const oldR = this.rectVNode(prevVc);
    const newR = this.rectVNode(vc);
    if (!oldR || !newR) return;
    const ow = +oldR.attrs.width;
    const oh = +oldR.attrs.height;
    const ox = +oldR.attrs.x;
    const oy = +oldR.attrs.y;
    const nw = +newR.attrs.width;
    const nh = +newR.attrs.height;
    const nx = +newR.attrs.x;
    const ny = +newR.attrs.y;
    if (ow === nw && oh === nh && ox === nx && oy === ny) return; // no size/origin change
    const rect = elm.querySelector("rect");
    if (!rect) return;
    rect.animate(
      [
        { width: `${ow}px`, height: `${oh}px`, x: `${ox}px`, y: `${oy}px` },
        { width: `${nw}px`, height: `${nh}px`, x: `${nx}px`, y: `${ny}px` },
      ],
      { duration: this.dur.flip, easing: "cubic-bezier(.2,.7,.2,1)" },
    );
  }

  private patch(elm: SVGElement, vc: VNode, prevVc: VNode | undefined): void {
    // A surviving (updated) node is always fully visible; clear any leftover enter-hold
    // opacity from an interrupted transition so a re-render can't strand it hidden.
    if (elm.style.opacity) elm.style.removeProperty("opacity");
    for (const k in vc.attrs) elm.setAttribute(k, String(vc.attrs[k]));
    while (elm.firstChild) elm.removeChild(elm.firstChild);
    const ch = vc.children || [];
    for (const c of ch) elm.appendChild(svgEl(c));
    const wasAccent = prevVc && /(^|\s)accent(\s|$)/.test(String(prevVc.attrs.class || ""));
    const isAccent = /(^|\s)accent(\s|$)/.test(String(vc.attrs.class || ""));
    if (isAccent && !wasAccent && this.dur.flash > 0) {
      elm.animate(
        [{ filter: "none" }, { filter: "drop-shadow(0 0 7px rgba(240,83,58,.95))" }, { filter: "none" }],
        { duration: this.dur.flash, easing: "ease" },
      );
    }
  }

  private renderCurrent(): void {
    const idx = this.player.i;
    const res = this.player.goto(idx);
    this.applyTree(res.tree, res.diff, res.flip);
    this.fitLabels();
    this.syncUI(this.player.steps[idx], idx);
  }

  /**
   * Post-pass over the settled node layer: shrink any label wider than its box
   * region so text never spills its rect — in ANY font, including the device's
   * (which is wider than the headless fallback). Runs once per settled render
   * (after applyTree mounts/updates, NOT during the FLIP transition). Idempotent:
   * prior textLength/lengthAdjust are stripped first so re-renders re-measure.
   *
   * Layout mirrors render.ts: obj/chip/gate center over the whole box (avail
   * = w-10); slot/ref divide the box at the divider (-hw+38) into a small NAME
   * region on the left and the value region on the right.
   */
  private fitLabels(): void {
    const PAD = 10; // total horizontal padding for a full-box label
    const nodes = this.nodeLayer.querySelectorAll<SVGGElement>("g.node");
    nodes.forEach((g) => {
      const rect = g.querySelector<SVGRectElement>("rect");
      if (!rect) return;
      const w = parseFloat(rect.getAttribute("width") || "0");
      if (!(w > 0)) return;
      const cls = g.getAttribute("class") || "";
      const divided = /(^|\s)(slot|ref)(\s|$)/.test(cls);
      // Available width per text role.
      const nameAvail = 38 - 8; // slot/ref NAME sits in the left region up to the divider at -hw+38
      const valAvail = w - 38 - 8; // slot/ref value sits in the right region
      const fullAvail = w - PAD; // obj/chip/gate span the whole box
      const texts = g.querySelectorAll<SVGTextElement>("text");
      texts.forEach((t) => {
        const tc = t.getAttribute("class") || "";
        let avail: number;
        if (divided && /(^|\s)vz-name(\s|$)/.test(tc)) avail = nameAvail;
        else if (divided && /(^|\s)(vz-val|vz-reflbl)(\s|$)/.test(tc)) avail = valAvail;
        else avail = fullAvail;
        // Idempotent: reset to the natural (CSS) size before measuring.
        t.removeAttribute("textLength");
        t.removeAttribute("lengthAdjust");
        t.style.removeProperty("font-size");
        if (!(avail > 0)) return;
        let len = 0;
        try {
          len = t.getComputedTextLength();
        } catch {
          return; // not measurable (e.g. not yet laid out) — skip this pass
        }
        if (len > avail + 0.5) {
          // Shrink the FONT-SIZE (keeps the mono letterforms natural — no glyph
          // squishing, which read as a "different font"). Floored so it stays
          // legible; boxes are sized so this rarely bites hard.
          const natural = parseFloat(getComputedStyle(t).fontSize) || 12;
          const scale = Math.max(0.74, avail / len);
          t.style.fontSize = (natural * scale).toFixed(2) + "px";
        }
      });
    });
  }

  private syncUI(scene: Scene, idx: number): void {
    const e = this.cfg.els;
    if (e.codePanel) {
      const lines = e.codePanel.querySelectorAll<HTMLElement>(".cl-line");
      lines.forEach((l) => l.classList.toggle("cur", +(l.getAttribute("data-line") || -1) === scene.codeLine));
    }
    if (e.ilPanel) {
      const ils = e.ilPanel.querySelectorAll<HTMLElement>(".il-line");
      ils.forEach((l) => l.classList.toggle("cur", +(l.getAttribute("data-il") || -1) === scene.ilLine));
    }
    if (e.caption) {
      const cap = e.caption;
      cap.style.opacity = "0";
      cap.innerHTML = scene.caption ?? "";
      requestAnimationFrame(() => {
        cap.style.opacity = "1";
      });
    }
    if (e.out) {
      if (scene.out) {
        e.out.textContent = scene.out;
        e.out.classList.add("show");
      } else {
        e.out.classList.remove("show");
        e.out.textContent = "";
      }
    }
    if (e.step) e.step.textContent = this.cfg.ui.stepFmt(idx + 1, this.total);
    if (e.scrub) {
      const segs = e.scrub.querySelectorAll<HTMLElement>(".vz-seg");
      segs.forEach((s, j) => {
        s.classList.toggle("cur", j === idx);
        s.classList.toggle("done", j < idx);
      });
    }
    if (e.prev) e.prev.disabled = idx === 0;
    if (e.next) e.next.disabled = idx === this.total - 1;
    if (idx > this.maxIndex) this.maxIndex = idx;
    if (this.cfg.onStep) this.cfg.onStep(this.maxIndex, this.total);
    this.state.index = idx;
  }

  goTo(i: number, opts: { force?: boolean } = {}): boolean {
    if (i >= this.gateIndex && !this.predictResolved && !opts.force) {
      this.showPredict();
      return false;
    }
    this.hidePredict();
    this.player.i = Math.max(0, Math.min(this.total - 1, i));
    this.renderCurrent();
    return true;
  }
  next(): boolean {
    return this.goTo(this.player.i + 1);
  }
  prev(): boolean {
    this.pause();
    return this.goTo(this.player.i - 1);
  }

  private showPredict(): void {
    const e = this.cfg.els;
    if (!e.predict) return;
    this.pause();
    if (e.predictTitle) e.predictTitle.textContent = this.cfg.ui.predictTitle;
    if (e.predictQ) e.predictQ.innerHTML = this.cfg.predictQ || "";
    if (e.predictShowTxt) e.predictShowTxt.textContent = this.cfg.ui.predictShow;
    e.predict.hidden = false;
  }
  private hidePredict(): void {
    const e = this.cfg.els;
    if (e.predict) e.predict.hidden = true;
  }
  resolvePredict(): void {
    this.predictResolved = true;
    this.state.predictResolved = true;
    this.goTo(this.gateIndex, { force: true });
  }

  play(): void {
    this.state.played = true;
    if (this.player.i >= this.total - 1) this.goTo(0, { force: true });
    this.playing = true;
    this.setPlayIcon(true);
    const tick = () => {
      if (!this.playing) return;
      const target = this.player.i + 1;
      if (target >= this.total) {
        this.pause();
        return;
      }
      if (target >= this.gateIndex && !this.predictResolved) {
        this.pause();
        this.showPredict();
        return;
      }
      this.goTo(target, { force: true });
      this.timer = setTimeout(tick, 1750);
    };
    this.timer = setTimeout(tick, 1150);
  }
  pause(): void {
    this.playing = false;
    this.setPlayIcon(false);
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
  toggle(): void {
    this.playing ? this.pause() : this.play();
  }
  private setPlayIcon(on: boolean): void {
    const e = this.cfg.els;
    if (!e.playIcon) return;
    e.playIcon.innerHTML = on ? PLAY_ICON : PAUSE_ICON;
    if (e.play) e.play.setAttribute("title", on ? this.cfg.ui.pause : this.cfg.ui.play);
  }

  /** Render the current (initial) frame. */
  render(): void {
    this.renderCurrent();
  }

  /** Jump straight to the final frame, resolving any predict gate (headless / reduced-motion). */
  showFinal(): void {
    this.predictResolved = true;
    this.state.predictResolved = true;
    this.goTo(this.total - 1, { force: true });
  }
}
