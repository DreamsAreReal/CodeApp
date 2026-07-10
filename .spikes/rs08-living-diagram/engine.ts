// RS-08 spike: reusable "living diagram engine".
// Architecture proved here: declarative MODEL (Scene snapshot) -> STEPS (Scene[]) ->
// pure RENDER (Scene -> VNode SVG tree) -> keyed DATA-JOIN reconcile (enter/update/exit)
// -> FLIP transition PLAN (transform/opacity only) -> deterministic SCRUBBER (goto index).
// One Scene[] serves lesson (predict-mode), drill (jump), and SRS cue (frozen frame thumbnail).
// Zero runtime dependencies. SVG string renderer so it runs headless in Node for tests.

// ---------- Declarative model (one immutable snapshot per step) ----------
export type NodeKind = 'box' | 'circle' | 'label';

export interface DNode {
  id: string;              // stable identity -> drives data-join enter/update/exit + FLIP
  kind: NodeKind;
  x: number; y: number;    // logical coords (SVG units)
  w?: number; h?: number;
  text?: string;
  accent?: boolean;        // signaling: active/highlighted element (Mayer)
  ghost?: boolean;         // faded (e.g. boxed value original)
}

export interface DEdge {
  id: string;
  from: string; to: string; // node ids (pointer / alias arrow)
  accent?: boolean;
}

export interface Scene {
  nodes: DNode[];
  edges: DEdge[];
  caption?: string;         // temporal-contiguity: word shown WITH the picture
  codeLine?: number;        // synchronized pseudocode highlight (VisuAlgo pattern)
  predict?: string;         // engagement>=responding: question posed BEFORE advancing
}

// A lesson is just an ordered list of Scenes. Author writes them directly OR emits them
// via the Recorder below (algorithm-visualizer command-log pattern).
export type Steps = Scene[];

// ---------- Virtual SVG node (pure render target; string-serializable) ----------
export interface VNode {
  tag: string;
  attrs: Record<string, string | number>;
  children?: VNode[];
  text?: string;
  key: string; // identity for reconcile
}

// Pure function: Scene -> VNode tree. No DOM, deterministic. Same Scene => same tree.
export function render(scene: Scene): VNode {
  const kids: VNode[] = [];
  for (const e of scene.edges) {
    const a = scene.nodes.find(n => n.id === e.from);
    const b = scene.nodes.find(n => n.id === e.to);
    if (!a || !b) continue;
    kids.push({
      tag: 'line', key: 'e:' + e.id,
      attrs: {
        x1: a.x, y1: a.y, x2: b.x, y2: b.y,
        class: e.accent ? 'edge accent' : 'edge',
      },
    });
  }
  for (const n of scene.nodes) {
    const cls = ['node', n.kind, n.accent ? 'accent' : '', n.ghost ? 'ghost' : '']
      .filter(Boolean).join(' ');
    const shape: VNode = n.kind === 'circle'
      ? { tag: 'circle', key: 'shape', attrs: { cx: 0, cy: 0, r: (n.w ?? 40) / 2, class: cls } }
      : { tag: 'rect', key: 'shape', attrs: { x: -(n.w ?? 60) / 2, y: -(n.h ?? 32) / 2, width: n.w ?? 60, height: n.h ?? 32, rx: 6, class: cls } };
    const label: VNode | null = n.text != null
      ? { tag: 'text', key: 'txt', attrs: { x: 0, y: 5, class: 'txt', 'text-anchor': 'middle' }, text: n.text }
      : null;
    kids.push({
      tag: 'g', key: 'n:' + n.id,
      // position via transform ONLY -> FLIP-friendly (compositor property)
      attrs: { transform: `translate(${n.x},${n.y})` },
      children: label ? [shape, label] : [shape],
    });
  }
  return { tag: 'g', key: 'root', attrs: {}, children: kids };
}

// Deterministic serializer (for headless tests + SRS thumbnail snapshotting).
export function serialize(v: VNode): string {
  const a = Object.keys(v.attrs).sort()
    .map(k => `${k}="${v.attrs[k]}"`).join(' ');
  const open = a ? `<${v.tag} ${a}>` : `<${v.tag}>`;
  const inner = v.text != null
    ? v.text
    : (v.children ?? []).map(serialize).join('');
  return `${open}${inner}</${v.tag}>`;
}

// ---------- Keyed data-join reconcile (D3 enter/update/exit) ----------
export interface Diff {
  enter: string[];  // keys new this step (fade/scale in)
  update: string[]; // keys present both (may move -> FLIP)
  exit: string[];   // keys gone (fade/scale out)
}
export function diff(prev: VNode | null, next: VNode): Diff {
  const pkeys = new Set(childKeys(prev));
  const nkeys = new Set(childKeys(next));
  const enter: string[] = [], update: string[] = [], exit: string[] = [];
  for (const k of nkeys) (pkeys.has(k) ? update : enter).push(k);
  for (const k of pkeys) if (!nkeys.has(k)) exit.push(k);
  return { enter: enter.sort(), update: update.sort(), exit: exit.sort() };
}
function childKeys(v: VNode | null): string[] {
  if (!v || !v.children) return [];
  return v.children.map(c => c.key);
}

// ---------- FLIP transition planner (pure; transform/opacity only) ----------
export interface FlipMove { key: string; dx: number; dy: number; }
// Given positions of 'update' nodes in prev vs next tree, compute the INVERT transform.
export function planFlip(prev: VNode, next: VNode, d: Diff): FlipMove[] {
  const pp = positions(prev), np = positions(next);
  const moves: FlipMove[] = [];
  for (const k of d.update) {
    const p = pp[k], n = np[k];
    if (!p || !n) continue;
    const dx = p.x - n.x, dy = p.y - n.y; // invert: start visually at old pos
    if (dx !== 0 || dy !== 0) moves.push({ key: k, dx, dy });
  }
  return moves;
}
function positions(v: VNode): Record<string, { x: number; y: number }> {
  const out: Record<string, { x: number; y: number }> = {};
  for (const c of v.children ?? []) {
    const t = String(c.attrs.transform ?? '');
    const m = /translate\(([-\d.]+),([-\d.]+)\)/.exec(t);
    if (m) out[c.key] = { x: +m[1], y: +m[2] };
  }
  return out;
}

// ---------- Deterministic scrubber (single source of truth = index) ----------
export interface PlayerOpts {
  reducedMotion?: boolean; // prefers-reduced-motion: cut transitions, keep steps
}
export class StepPlayer {
  private i = 0;
  private prevTree: VNode | null = null;
  steps: Steps;
  private opts: PlayerOpts;
  constructor(steps: Steps, opts: PlayerOpts = {}) { this.steps = steps; this.opts = opts; }
  get index() { return this.i; }
  get length() { return this.steps.length; }
  get scene() { return this.steps[this.i]; }
  // Pure transition to an arbitrary index -> deterministic (scrub / drill jump / SRS).
  goto(i: number): { tree: VNode; diff: Diff; flip: FlipMove[] } {
    i = Math.max(0, Math.min(this.steps.length - 1, i));
    const tree = render(this.steps[i]);
    const d = diff(this.prevTree, tree);
    const flip = this.opts.reducedMotion ? [] : (this.prevTree ? planFlip(this.prevTree, tree, d) : []);
    this.i = i; this.prevTree = tree;
    return { tree, diff: d, flip };
  }
  next() { return this.goto(this.i + 1); }
  prev() { return this.goto(this.i - 1); }
  // Frozen single frame for an SRS cue card thumbnail (no player chrome).
  frame(i: number): string { return serialize(render(this.steps[i])); }
}

// ---------- Recorder: algorithm-visualizer command-log pattern ----------
// Author instruments plain algorithm code; each snapshot() = one Scene (like AV `delay`).
export class Recorder {
  private steps: Scene[] = [];
  private base: DNode[] = [];
  constructor(nodes: DNode[]) { this.base = nodes.map(n => ({ ...n })); }
  set(id: string, patch: Partial<DNode>) {
    const n = this.base.find(x => x.id === id);
    if (n) Object.assign(n, patch);
    return this;
  }
  swapPos(a: string, b: string) {
    const na = this.base.find(x => x.id === a), nb = this.base.find(x => x.id === b);
    if (na && nb) { const tx = na.x, ty = na.y; na.x = nb.x; na.y = nb.y; nb.x = tx; nb.y = ty; }
    return this;
  }
  clearAccents() { for (const n of this.base) n.accent = false; return this; }
  snapshot(scene: Partial<Scene> = {}) {
    this.steps.push({ nodes: this.base.map(n => ({ ...n })), edges: scene.edges ?? [], ...scene });
    return this;
  }
  done(): Steps { return this.steps; }
}
