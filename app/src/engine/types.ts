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

export interface DiagramNode {
  id: string;
  kind: NodeKind;
  x: number;
  y: number;
  w: number;
  h: number;
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
