/**
 * Living-diagram engine — core types (RS-08 architecture).
 * Extracted from docs/research/concepts/lesson-boxing into a reusable module.
 *
 * Pipeline: declarative Scene -> pure render(Scene) -> keyed VNode tree ->
 * data-join diff (enter/update/exit) -> FLIP (transform-only) -> StepPlayer.
 * Zero runtime dependencies; SVG-only backdrop.
 */

/** Attribute bag for a virtual SVG node. Numbers are stringified on mount. */
export type VAttrs = Record<string, string | number>;

/** Immutable virtual node produced by `render`. `key` drives the data-join. */
export interface VNode {
  tag: string;
  key: string;
  attrs: VAttrs;
  children?: VNode[];
  text?: string | number | null;
}

/** Diagram primitives (the shared visual vocabulary, per lesson-format §3). */
export type NodeKind = "slot" | "ref" | "obj" | "chip" | "gate";
export type NodeState = "ok" | "fail" | "";

/**
 * Where a node lives, declared STRUCTURALLY (auto-layout v2). The engine computes
 * the pixel position from this, so the author can never produce a crooked frame.
 *   - `{ zone, row, col? }` — the node sits in a zone's grid: nodes sharing
 *     `(zone,row)` form a horizontal ROW (left→right by `col`, then array order).
 *   - `{ in, order? }` — the node is NESTED inside another node (e.g. a hoisted
 *     field slot inside its DisplayClass obj); the parent auto-grows to contain it.
 * A node with `at` needs no `x/y`; a node with explicit `x/y` and no `at` is the
 * documented escape hatch (honoured, snapped + clamped into the viewBox).
 */
export type NodePlacement = { zone: string; row: number; col?: number } | { in: string; order?: number };

export interface DiagramNode {
  id: string;
  kind: NodeKind;
  /** Optional: computed by `layoutScene` from `at`. Explicit x/y = escape hatch. */
  x?: number;
  /** Optional: computed by `layoutScene` from `at`. Explicit x/y = escape hatch. */
  y?: number;
  /** Structural placement (auto-layout v2). Preferred over x/y — see NodePlacement. */
  at?: NodePlacement;
  /** Optional: derived by `sizeNode` from the width ladder when omitted. */
  w?: number;
  /** Optional: derived by `sizeNode` from the kind-height map when omitted. */
  h?: number;
  name?: string;
  value?: string | number;
  typeTag?: string;
  accent?: boolean;
  good?: boolean;
  ghost?: boolean;
  state?: NodeState;
  label?: string; // gate label
  detail?: string; // gate detail line
}

export interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  accent?: boolean;
  /** 'ortho' (default) = rounded orthogonal L/Z route; 'straight' = plain line. */
  route?: "ortho" | "straight";
}

/** A single animation frame: a snapshot of nodes + edges plus synced UI hints. */
export interface Scene {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  caption?: string;
  codeLine?: number;
  ilLine?: number;
  out?: string; // console output at this step
  /** internal: arrow marker url, injected by the player per instance */
  _marker?: string;
}

/** A static backdrop rectangle (e.g. STACK / HEAP zone). */
export interface Zone {
  /** Optional id: a node's `at.zone` matches a zone by this id (auto-layout v2). */
  id?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cls: string;
  label: string;
  labelCls: string;
  lx: number;
  ly: number;
  sub?: string;
  subCls?: string;
  subY?: number;
}

/** Result of stepping the player to an index. */
export interface StepResult {
  tree: VNode;
  diff: DiffResult;
  flip: FlipMove[];
}

export interface DiffResult {
  enter: string[];
  update: string[];
  exit: string[];
}

export interface FlipMove {
  key: string;
  dx: number;
  dy: number;
}
