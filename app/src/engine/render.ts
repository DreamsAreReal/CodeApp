/**
 * Pure render: Scene -> keyed VNode tree. No DOM here — deterministic and
 * unit-testable. Every node/edge gets a stable `key` so the diff can match
 * them across steps (data-join).
 *
 * Design-system rules (docs/design/viz-design-spec.md):
 *   - GRID = 2: `snap(v)` guards every rect/path coordinate for crisp H/V strokes.
 *   - One height per kind (`KIND_H`); width from a 6-rung ladder (`W_LADDER`).
 *   - `sizeNode` derives w/h from a node's text content when they are omitted, and
 *     snaps+clamps explicit w/h onto the same ladder/heights.
 *   - Edges route ORTHOGONALLY (`routeEdge`): ports on box EDGES, ≤2 bends, rounded
 *     corners, with a straight-segment exception when the two ports are colinear.
 */
import type { DiagramEdge, DiagramNode, NodeKind, Scene, VNode } from "./types.ts";

/** Author grid guard: snap to GRID=2 user-units so H/V strokes stay crisp. */
export function snap(v: number): number {
  return Math.round(v / 2) * 2;
}

/** One corner radius per kind (replaces the old inline rx 7/9/11). */
export const KIND_RX: Record<NodeKind, number> = { chip: 6, slot: 8, ref: 8, obj: 8, gate: 10 };

/** One height per kind (single-line). Tall content bumps to the 2-line variant. */
export const KIND_H: Record<NodeKind, number> = { chip: 28, slot: 40, ref: 40, obj: 44, gate: 48 };
/** 2-line / tall variants, kept inside the HEIGHT-IN-SCALE allow-list {28,40,44,48,60}. */
const KIND_H2: Partial<Record<NodeKind, number>> = { chip: 44, obj: 60, gate: 60 };

/** The width ladder (≥25% steps). Every box width snaps onto one of these rungs. */
export const W_LADDER = [56, 72, 96, 120, 144, 168] as const;
const W_MIN = W_LADDER[0];
const W_MAX = W_LADDER[W_LADDER.length - 1];

const PADX = 8; // obj/chip/gate horizontal padding (per side)
const NAME_GUTTER = 38; // slot/ref left name region up to the divider

/** Text-measuring hook. In the browser we back it with a canvas (Rubik/zone-aware);
 * headless / pure callers fall back to a mono advance of ~0.6·fontSize. */
export type Measure = (text: string, fontSize: number, mono: boolean) => number;

/** Deterministic fallback advance — good enough to pick a ladder rung; the DOM
 * fitLabels pass is the last-resort shrink for the device's exact font metrics. */
export const monoMeasure: Measure = (text, fontSize) => (text ? text.length : 0) * fontSize * 0.6;

/** Clamp a needed inner width up onto the nearest ladder rung ≥ needed (cap W_MAX). */
function ladderFor(needed: number): number {
  for (const rung of W_LADDER) if ((rung as number) >= needed) return rung;
  return W_MAX;
}

/**
 * Derive a node's box size. When `w`/`h` are omitted we compute them from the text
 * content + kind; when present we snap them and clamp onto the ladder / height map,
 * so an explicit "one huge / one tiny" author value collapses onto the scale too.
 */
export function sizeNode(n: DiagramNode, measure: Measure = monoMeasure): { w: number; h: number } {
  const kind = n.kind;

  // ---- height: one per kind; bump to the tall variant only when text demands it ----
  let h: number;
  if (n.h != null) {
    h = clampHeight(kind, snap(n.h));
  } else {
    h = KIND_H[kind];
    // gate carries two lines (label + detail); obj carries tag + value.
    const twoLine = (kind === "gate" && !!n.detail && !!n.label) || (kind === "obj" && !!n.typeTag && !!n.value);
    if (twoLine && KIND_H2[kind]) h = Math.max(h, KIND_H2[kind]!);
  }

  // ---- width: explicit -> snap+clamp onto ladder; else derive from measured text ----
  let w: number;
  if (n.w != null) {
    w = clampWidth(snap(n.w));
  } else {
    const needed = neededInnerWidth(n, measure);
    w = ladderFor(needed);
  }
  return { w: snap(w), h: snap(h) };
}

function clampHeight(kind: NodeKind, h: number): number {
  const base = KIND_H[kind];
  const tall = KIND_H2[kind] ?? 60;
  // Snap explicit heights onto {base, tall} (nearest), staying in the allow-list.
  return Math.abs(h - base) <= Math.abs(h - tall) ? base : Math.min(tall, 60);
}

function clampWidth(w: number): number {
  if (w <= W_MIN) return W_MIN;
  if (w >= W_MAX) return W_MAX;
  // nearest rung
  let best: number = W_LADDER[0];
  let bestD = Infinity;
  for (const rung of W_LADDER) {
    const d = Math.abs(rung - w);
    if (d < bestD) {
      bestD = d;
      best = rung;
    }
  }
  return best;
}

/** Widest text a node must hold + padding, in user units (before ladder snap). */
function neededInnerWidth(n: DiagramNode, measure: Measure): number {
  const t = (s: string | number | undefined, fs: number, mono = true) => measure(s == null ? "" : String(s), fs, mono);
  switch (n.kind) {
    case "chip":
      return t(n.value, 13) + 2 * PADX;
    case "obj": {
      const tag = t(n.typeTag, 10);
      const val = t(n.value, 18);
      return Math.max(tag, val) + 2 * PADX;
    }
    case "gate": {
      const lbl = t(n.label, 9.5);
      const dt = t(n.detail, 11);
      return Math.max(lbl, dt) + 2 * PADX;
    }
    case "slot": {
      const val = t(n.value, 15);
      return NAME_GUTTER + val + PADX;
    }
    case "ref": {
      const val = t(n.value ?? "ref", 9.5);
      return NAME_GUTTER + val + PADX;
    }
    default:
      return W_MIN;
  }
}

function findNode(nodes: DiagramNode[], id: string): DiagramNode | null {
  for (const n of nodes) if (n.id === id) return n;
  return null;
}

/** A node reduced to a snapped center + half-extents (its box geometry). */
interface Box {
  cx: number;
  cy: number;
  hw: number;
  hh: number;
}
function boxOf(n: DiagramNode, measure: Measure): Box {
  const { w, h } = sizeNode(n, measure);
  // x/y are resolved by layoutScene before render; fall back to 0 for the rare
  // pure-render caller that hands over a coordinate-free node.
  return { cx: snap(n.x ?? 0), cy: snap(n.y ?? 0), hw: w / 2, hh: h / 2 };
}

/** A port: a point on a box border + the side it faces (for perpendicular jogs). */
interface Port {
  x: number;
  y: number;
  side: "E" | "W" | "N" | "S";
}

const GRID = 2; // colinear tolerance for the straight-segment exception
const MIN_STUB = 12; // first/last straight segment length before a jog
const CORNER = 6; // corner arc radius (clamped to half the shorter adjacent segment)

/**
 * Route a rounded ORTHOGONAL path between two boxes. Ports sit on the box EDGES
 * (never centers); the port pair is chosen by the dominant axis of the center
 * delta. Emits ≤2 bends (max 3 segments) as an H/V/H (or V/H/V) path with arc
 * corners; when the two chosen ports are colinear (|Δ| ≤ GRID) it degrades to a
 * single straight segment. The final point lands ON the target border so the
 * arrowhead tip (marker refX at the tip) sits on the box, not under it.
 */
export function routeEdge(a: Box, b: Box, route: "ortho" | "straight" = "ortho"): string {
  const dx = b.cx - a.cx;
  const dy = b.cy - a.cy;
  const horizontal = Math.abs(dx) >= Math.abs(dy);

  const from = portOf(a, horizontal, horizontal ? (dx >= 0 ? "E" : "W") : dy >= 0 ? "S" : "N");
  const to = portOf(b, horizontal, horizontal ? (dx >= 0 ? "W" : "E") : dy >= 0 ? "N" : "S");

  const ax = snap(from.x);
  const ay = snap(from.y);
  const bx = snap(to.x);
  const by = snap(to.y);

  // STRAIGHT exception: ports already colinear within the grid → plain segment.
  if (route === "straight" || Math.abs(ax - bx) <= GRID || Math.abs(ay - by) <= GRID) {
    return `M ${ax} ${ay} L ${bx} ${by}`;
  }

  if (horizontal) {
    // H → V → H: jog at a mid X. Keep the mid off the ports by ≥ MIN_STUB.
    let mid = snap((ax + bx) / 2);
    mid = clampMid(mid, ax, bx);
    return roundedHVH(ax, ay, mid, bx, by);
  }
  // V → H → V: jog at a mid Y.
  let mid = snap((ay + by) / 2);
  mid = clampMid(mid, ay, by);
  return roundedVHV(ax, ay, mid, bx, by);
}

/** Keep the jog coordinate at least MIN_STUB away from both endpoints. */
function clampMid(mid: number, p0: number, p1: number): number {
  const lo = Math.min(p0, p1);
  const hi = Math.max(p0, p1);
  if (hi - lo <= 2 * MIN_STUB) return snap((lo + hi) / 2);
  return snap(Math.max(lo + MIN_STUB, Math.min(hi - MIN_STUB, mid)));
}

/** Pick the border port for a box on the side that faces the flow. */
function portOf(box: Box, _horizontal: boolean, side: Port["side"]): Port {
  switch (side) {
    case "E":
      return { x: box.cx + box.hw, y: box.cy, side };
    case "W":
      return { x: box.cx - box.hw, y: box.cy, side };
    case "S":
      return { x: box.cx, y: box.cy + box.hh, side };
    case "N":
    default:
      return { x: box.cx, y: box.cy - box.hh, side };
  }
}

/** Clamp corner radius to half the shorter of the two adjacent segments. */
function cornerR(seg1: number, seg2: number): number {
  return Math.max(0, Math.min(CORNER, seg1 / 2, seg2 / 2));
}

/** M ax,ay → H to (mid) → V to (by) → H to (bx), with arc corners at the two bends. */
function roundedHVH(ax: number, ay: number, mid: number, bx: number, by: number): string {
  const sgnX1 = Math.sign(mid - ax) || 1; // first horizontal direction
  const sgnY = Math.sign(by - ay) || 1; // vertical direction
  const sgnX2 = Math.sign(bx - mid) || 1; // last horizontal direction
  const seg1 = Math.abs(mid - ax);
  const segV = Math.abs(by - ay);
  const seg3 = Math.abs(bx - mid);
  const r1 = cornerR(seg1, segV);
  const r2 = cornerR(segV, seg3);
  // sweep flag: 1 for a "clockwise" turn given the two directions.
  const sw1 = sgnX1 * sgnY > 0 ? 1 : 0;
  const sw2 = sgnY * sgnX2 > 0 ? 0 : 1;
  let d = `M ${ax} ${ay}`;
  d += ` H ${mid - sgnX1 * r1}`;
  d += ` A ${r1} ${r1} 0 0 ${sw1} ${mid} ${ay + sgnY * r1}`;
  d += ` V ${by - sgnY * r2}`;
  d += ` A ${r2} ${r2} 0 0 ${sw2} ${mid + sgnX2 * r2} ${by}`;
  d += ` H ${bx}`;
  return d;
}

/** M ax,ay → V to (mid) → H to (bx) → V to (by), with arc corners at the two bends. */
function roundedVHV(ax: number, ay: number, mid: number, bx: number, by: number): string {
  const sgnY1 = Math.sign(mid - ay) || 1;
  const sgnX = Math.sign(bx - ax) || 1;
  const sgnY2 = Math.sign(by - mid) || 1;
  const seg1 = Math.abs(mid - ay);
  const segH = Math.abs(bx - ax);
  const seg3 = Math.abs(by - mid);
  const r1 = cornerR(seg1, segH);
  const r2 = cornerR(segH, seg3);
  const sw1 = sgnY1 * sgnX > 0 ? 0 : 1;
  const sw2 = sgnX * sgnY2 > 0 ? 1 : 0;
  let d = `M ${ax} ${ay}`;
  d += ` V ${mid - sgnY1 * r1}`;
  d += ` A ${r1} ${r1} 0 0 ${sw1} ${ax + sgnX * r1} ${mid}`;
  d += ` H ${bx - sgnX * r2}`;
  d += ` A ${r2} ${r2} 0 0 ${sw2} ${bx} ${mid + sgnY2 * r2}`;
  d += ` V ${by}`;
  return d;
}

export function render(scene: Scene, measure: Measure = monoMeasure): VNode {
  const kids: VNode[] = [];

  for (const e of scene.edges) {
    const a = findNode(scene.nodes, e.from);
    const b = findNode(scene.nodes, e.to);
    if (!a || !b) continue;
    const d = routeEdge(boxOf(a, measure), boxOf(b, measure), edgeRoute(e));
    kids.push({
      tag: "path",
      key: "e:" + e.id,
      attrs: {
        d,
        fill: "none",
        "marker-end": scene._marker || "url(#vz-arrow)",
        class: e.accent ? "edge accent" : "edge",
        "data-edge": e.id,
      },
    });
  }

  for (const n of scene.nodes) kids.push(renderNode(n, measure));
  return { tag: "g", key: "root", attrs: {}, children: kids };
}

function edgeRoute(e: DiagramEdge): "ortho" | "straight" {
  return e.route === "straight" ? "straight" : "ortho";
}

export function renderNode(n: DiagramNode, measure: Measure = monoMeasure): VNode {
  const cls = ["node", n.kind, n.accent ? "accent" : "", n.state || "", n.good ? "good" : "", n.ghost ? "ghost" : ""]
    .filter(Boolean)
    .join(" ");
  const children: VNode[] = [];
  const { w, h } = sizeNode(n, measure);
  const hw = w / 2;
  const hh = h / 2;
  const rx = KIND_RX[n.kind];

  if (n.kind === "slot") {
    children.push({ tag: "rect", key: "bx", attrs: { x: -hw, y: -hh, width: w, height: h, rx, class: "vz-slot" } });
    children.push({ tag: "line", key: "dv", attrs: { x1: -hw + 38, y1: -hh + 5, x2: -hw + 38, y2: hh - 5, class: "vz-div" } });
    children.push({ tag: "text", key: "nm", attrs: { x: -hw + 19, y: 5, "text-anchor": "middle", class: "vz-name" }, text: n.name ?? "" });
    children.push({ tag: "text", key: "vl", attrs: { x: 19, y: 5, "text-anchor": "middle", class: "vz-val" }, text: n.value ?? "" });
  } else if (n.kind === "ref") {
    children.push({ tag: "rect", key: "bx", attrs: { x: -hw, y: -hh, width: w, height: h, rx, class: "vz-slot" } });
    children.push({ tag: "line", key: "dv", attrs: { x1: -hw + 38, y1: -hh + 5, x2: -hw + 38, y2: hh - 5, class: "vz-div" } });
    children.push({ tag: "text", key: "nm", attrs: { x: -hw + 19, y: 5, "text-anchor": "middle", class: "vz-name" }, text: n.name ?? "" });
    children.push({ tag: "text", key: "rl", attrs: { x: 8, y: 5, "text-anchor": "middle", class: "vz-reflbl" }, text: n.value ?? "ref" });
    if (!n.value) children.push({ tag: "circle", key: "dot", attrs: { cx: hw - 14, cy: 0, r: 4, class: "vz-refdot" } });
  } else if (n.kind === "obj") {
    children.push({ tag: "rect", key: "bx", attrs: { x: -hw, y: -hh, width: w, height: h, rx, class: "vz-obj" } });
    children.push({ tag: "text", key: "tg", attrs: { x: 0, y: -hh + 14, "text-anchor": "middle", class: "vz-tag" }, text: n.typeTag ?? "" });
    children.push({ tag: "text", key: "ov", attrs: { x: 0, y: hh - 9, "text-anchor": "middle", class: "vz-objval" }, text: n.value ?? "" });
  } else if (n.kind === "chip") {
    children.push({ tag: "rect", key: "bx", attrs: { x: -hw, y: -hh, width: w, height: h, rx, class: "vz-chip" } });
    children.push({ tag: "text", key: "cv", attrs: { x: 0, y: 5, "text-anchor": "middle", class: "vz-chipval" }, text: n.value ?? "" });
  } else if (n.kind === "gate") {
    children.push({ tag: "rect", key: "bx", attrs: { x: -hw, y: -hh, width: w, height: h, rx, class: "vz-gate" } });
    children.push({ tag: "text", key: "gl", attrs: { x: 0, y: -hh + 15, "text-anchor": "middle", class: "vz-gatelbl" }, text: n.label ?? "" });
    children.push({ tag: "text", key: "dt", attrs: { x: 0, y: hh - 9, "text-anchor": "middle", class: "vz-gatedt" }, text: n.detail ?? "" });
  }

  return {
    tag: "g",
    key: "n:" + n.id,
    attrs: { transform: `translate(${snap(n.x ?? 0)},${snap(n.y ?? 0)})`, class: cls, "data-node": n.id },
    children,
  };
}
