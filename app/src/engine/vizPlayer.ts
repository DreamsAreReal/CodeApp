/**
 * VizPlayer — configurable DOM adapter for the living-diagram engine.
 * One implementation drives EVERY segment animation across all lessons:
 * it mounts an SVG stage, applies data-join results (enter/update/exit),
 * runs FLIP + accent flashes via WAAPI, syncs the code/IL/console/caption/
 * scrubber UI, gates on a predict-then-run step, and autoplays on demand.
 */
import { baseXY, durations, svgEl, SVGNS, type Durations } from "./dom.ts";
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

    const steps = cfg.scenes.map((s) => {
      s._marker = "url(#" + this.markerId + ")";
      return s;
    });
    this.player = new StepPlayer(steps, { reducedMotion: this.reduced });
    this.total = this.player.steps.length;
    this.state = { index: 0, total: this.total, predictAt: this.gateIndex, predictResolved: false, played: false };

    this.buildSVG();
  }

  private buildSVG(): void {
    const svg = document.createElementNS(SVGNS, "svg") as SVGSVGElement;
    svg.setAttribute("viewBox", this.cfg.viewBox);
    svg.setAttribute("role", "img");

    const defs = document.createElementNS(SVGNS, "defs");
    defs.innerHTML =
      '<marker id="' +
      this.markerId +
      '" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto" markerUnits="userSpaceOnUse">' +
      '<path d="M0,0 L6,3 L0,6 Z" fill="#C43D28"/></marker>';
    svg.appendChild(defs);

    const chrome = document.createElementNS(SVGNS, "g");
    chrome.setAttribute("class", "vz-chrome");
    let html = "";
    const zones = this.cfg.zones || [];
    for (const z of zones) {
      html += '<rect class="' + z.cls + '" x="' + z.x + '" y="' + z.y + '" width="' + z.w + '" height="' + z.h + '" rx="14"/>';
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

  private applyTree(vtree: VNode, d: DiffResult, flip: FlipMove[]): void {
    // exits
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

    // enters + updates
    const children = vtree.children || [];
    for (const vc of children) {
      const key = vc.key;
      let elm = this.elMap[key];
      const b = baseXY(vc);
      if (!elm) {
        elm = svgEl(vc);
        this.layerFor(key).appendChild(elm);
        this.elMap[key] = elm;
        this.enterAnim(elm, vc);
      } else {
        this.patch(elm, vc, this.vmap[key]);
      }
      this.baseMap[key] = b;
      this.vmap[key] = vc;
    }

    // FLIP moves
    if (!this.reduced) {
      for (const mv of flip) {
        const g = this.elMap[mv.key];
        if (!g) continue;
        const bb = this.baseMap[mv.key];
        g.animate(
          [
            { transform: `translate(${bb.x + mv.dx}px,${bb.y + mv.dy}px)` },
            { transform: `translate(${bb.x}px,${bb.y}px)` },
          ],
          { duration: this.dur.flip, easing: "cubic-bezier(.2,.7,.2,1)" },
        );
      }
    }
  }

  private enterAnim(elm: SVGElement, vc: VNode): void {
    if (this.dur.enter <= 0) return;
    const b = baseXY(vc);
    if (vc.key.charAt(0) === "e") {
      elm.animate([{ opacity: 0 }, { opacity: 1 }], { duration: this.dur.enter, easing: "ease" });
    } else {
      elm.animate(
        [
          { opacity: 0, transform: `translate(${b.x}px,${b.y}px) scale(.62)` },
          { opacity: 1, transform: `translate(${b.x}px,${b.y}px) scale(1)` },
        ],
        { duration: this.dur.enter, easing: "cubic-bezier(.2,.8,.2,1)" },
      );
    }
  }

  private patch(elm: SVGElement, vc: VNode, prevVc: VNode | undefined): void {
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
        // Idempotent: always drop any prior fit before re-measuring.
        t.removeAttribute("textLength");
        t.removeAttribute("lengthAdjust");
        if (!(avail > 0)) return;
        let len = 0;
        try {
          len = t.getComputedTextLength();
        } catch {
          return; // not measurable (e.g. not yet laid out) — skip this pass
        }
        if (len > avail) {
          t.setAttribute("textLength", String(avail));
          t.setAttribute("lengthAdjust", "spacingAndGlyphs");
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
