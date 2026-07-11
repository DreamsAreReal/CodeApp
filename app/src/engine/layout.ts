/**
 * Auto-layout v2 — bug-proof authoring (docs/design/viz-design-spec.md §Auto-layout).
 *
 * `layoutScene(scene, zones, measure)` is a PURE, DETERMINISTIC transform: it takes a
 * scene whose nodes declare only STRUCTURE (`at: {zone,row,col}` or `at: {in:parentId}`)
 * and returns a COPY of the scene where every node carries concrete, grid-snapped
 * x/y/w/h. Because the engine — not the author — computes positions, overflow / overlap
 * / misalignment become impossible by construction; the only way to fail is to author
 * a scene that genuinely cannot fit, which surfaces as a thrown Error (never a silent
 * visual bug).
 *
 * Guarantees per the spec:
 *   - every zone-placed node sits inside its zone with PAD≥8 on every side;
 *   - all nodes of one row share a single center-Y (center alignment; heights may differ);
 *   - rows stack vertically, the whole block centered in the zone inner box;
 *   - a nested node is stacked inside its parent, below the header, and the parent
 *     auto-grows in height to contain its children;
 *   - explicit x/y (no `at`) is honoured as an escape hatch (snapped + clamped to viewBox);
 *   - a node with neither `at` nor x/y throws an authoring error.
 *
 * Edges are untouched — `routeEdge` derives orthogonal routes from the final positions.
 */
import { monoMeasure, sizeNode, snap, W_LADDER, type Measure } from "./render.ts";
import type { DiagramNode, Scene, Zone } from "./types.ts";

/** Layout tokens (from the spacing scale {8,12,16,24,40,48}). */
const GRID = 2; // snap unit (mirrors render.ts snap())
const PAD = 8; // zone inner padding on every side; also nested left/right/bottom inset
const GUTTER_CROSS = 16; // horizontal gap between nodes in a row
const GUTTER_ROW = 16; // vertical gap between stacked rows
const HEADER_H = 20; // reserved header band inside a parent that carries a typeTag
const NEST_GAP = 6; // vertical gap between stacked nested children
const W_LADDER_MIN = 56; // narrowest ladder rung — the floor for overflow shrink

/** A node with its resolved geometry (center + size), before write-back. */
interface Placed {
  node: DiagramNode;
  cx: number;
  cy: number;
  w: number;
  h: number;
}

function isZonePlacement(at: NonNullable<DiagramNode["at"]>): at is { zone: string; row: number; col?: number } {
  return (at as { zone?: string }).zone != null;
}
function isNestedPlacement(at: NonNullable<DiagramNode["at"]>): at is { in: string; order?: number } {
  return (at as { in?: string }).in != null;
}

/**
 * Compute concrete geometry for every node in `scene` and return a new scene with
 * x/y/w/h written back (edges + all other fields copied verbatim). Deterministic:
 * same input → same output, no DOM, no randomness.
 */
export function layoutScene(
  scene: Scene,
  zones: Zone[] = [],
  measure: Measure = monoMeasure,
  viewBox?: string,
): Scene {
  const nodes = scene.nodes;
  const byId = new Map<string, DiagramNode>();
  for (const n of nodes) byId.set(n.id, n);

  // Partition the nodes by placement kind.
  const zonePlaced: DiagramNode[] = [];
  const nested: DiagramNode[] = [];
  const explicit: DiagramNode[] = [];
  for (const n of nodes) {
    if (n.at && isZonePlacement(n.at)) zonePlaced.push(n);
    else if (n.at && isNestedPlacement(n.at)) nested.push(n);
    else if (n.x != null && n.y != null) explicit.push(n);
    else {
      throw new Error(
        `layout: node '${n.id}' has neither an 'at' placement nor explicit x/y — ` +
          `declare placement (at:{zone,row} or at:{in:parentId}) so the engine can position it`,
      );
    }
  }

  // Size every node first. NESTED nodes are sized before their parents so a wide
  // child can widen the parent (the parent's auto-grow reads child sizes).
  const size = new Map<string, { w: number; h: number }>();
  for (const n of nodes) size.set(n.id, sizeNode(n, measure));

  // Group nested children by parent id, ordered by `order` then array order.
  const childrenOf = new Map<string, DiagramNode[]>();
  for (const n of nested) {
    const at = n.at as { in: string; order?: number };
    const arr = childrenOf.get(at.in);
    if (arr) arr.push(n);
    else childrenOf.set(at.in, [n]);
  }
  for (const [pid, arr] of childrenOf) {
    if (!byId.has(pid)) {
      throw new Error(`layout: nested node references unknown parent '${pid}'`);
    }
    arr.sort((a, b) => nestedOrder(a) - nestedOrder(b) || nodes.indexOf(a) - nodes.indexOf(b));
  }

  // Auto-grow a parent's height/width to contain its nested children BEFORE the
  // parent participates in zone row distribution.
  const grown = new Map<string, { w: number; h: number }>();
  for (const [pid, kids] of childrenOf) {
    const parent = byId.get(pid)!;
    const base = size.get(pid)!;
    const header = parent.typeTag ? HEADER_H : PAD;
    let innerH = 0;
    let maxKidW = 0;
    for (const k of kids) {
      const ks = size.get(k.id)!;
      innerH += ks.h;
      if (ks.w > maxKidW) maxKidW = ks.w;
    }
    innerH += NEST_GAP * (kids.length - 1);
    const neededH = snap(header + innerH + PAD);
    const neededW = snap(maxKidW + 2 * PAD);
    grown.set(pid, { w: snap(Math.max(base.w, neededW)), h: snap(Math.max(base.h, neededH)) });
  }

  // Effective size = grown size when a parent, else the sized value.
  const sizeOf = (id: string): { w: number; h: number } => grown.get(id) ?? size.get(id)!;

  // ---- viewBox bounds for clamping the escape hatch ----
  const { vbW, vbH } = parseViewBox(viewBox, zones);

  const placed = new Map<string, Placed>();

  // ---- 1. ZONE-PLACED nodes: rows within each zone ----
  const zoneById = new Map<string, Zone>();
  for (const z of zones) if (z.id) zoneById.set(z.id, z);

  // group zone-placed nodes by zone id
  const byZone = new Map<string, DiagramNode[]>();
  for (const n of zonePlaced) {
    const at = n.at as { zone: string; row: number; col?: number };
    const arr = byZone.get(at.zone);
    if (arr) arr.push(n);
    else byZone.set(at.zone, [n]);
  }

  for (const [zid, zNodes] of byZone) {
    const zone = zoneById.get(zid);
    if (!zone) {
      throw new Error(`layout: node placement references unknown zone id '${zid}' (give the Zone an id)`);
    }
    layoutZone(zid, zone, zNodes, sizeOf, placed);
  }

  // ---- 2. NESTED nodes: stack inside the (now positioned) parent ----
  for (const [pid, kids] of childrenOf) {
    const parent = placed.get(pid);
    if (!parent) {
      // Parent is an escape-hatch/explicit node — position it now so children resolve.
      const p = byId.get(pid)!;
      const ps = sizeOf(pid);
      const cx = snap(clamp(p.x ?? 0, ps.w / 2, vbW - ps.w / 2));
      const cy = snap(clamp(p.y ?? 0, ps.h / 2, vbH - ps.h / 2));
      placed.set(pid, { node: p, cx, cy, w: ps.w, h: ps.h });
    }
    layoutNested(placed.get(pid)!, kids, sizeOf, placed);
  }

  // ---- 3. EXPLICIT (escape hatch): snap + clamp into the viewBox ----
  for (const n of explicit) {
    const s = sizeOf(n.id);
    const cx = snap(clamp(n.x!, s.w / 2, vbW - s.w / 2));
    const cy = snap(clamp(n.y!, s.h / 2, vbH - s.h / 2));
    placed.set(n.id, { node: n, cx, cy, w: s.w, h: s.h });
  }

  // ---- write back: produce a copy of the scene with concrete x/y/w/h ----
  const outNodes: DiagramNode[] = nodes.map((n) => {
    const p = placed.get(n.id);
    if (!p) return { ...n };
    return { ...n, x: p.cx, y: p.cy, w: p.w, h: p.h };
  });

  return { ...scene, nodes: outNodes };
}

function nestedOrder(n: DiagramNode): number {
  const at = n.at as { in: string; order?: number };
  return at.order == null ? 0 : at.order;
}

/**
 * Lay out one zone's nodes as a GRID of cells `(row, col)`.
 *
 * COLUMNS (auto-layout v2 grid model):
 *   - The set of columns is the union of every node's `col` (no `col` ⇒ col 0).
 *   - A column's width is the MAX cell-width over all rows (a cell may hold >1 node
 *     — a horizontal sub-row, backward-compatible with the old "row of N nodes").
 *   - Columns run left→right with GUTTER_CROSS between them; the WHOLE column block
 *     is centered in the zone inner width, so each column has ONE center-X that is
 *     STABLE across rows (an empty cell never shifts its column). This is what lets
 *     a 2D timeline keep "left" nodes of different rows on a shared X.
 *
 * ROWS: a row's height is the MAX node height in that row; rows stack top→down with
 * GUTTER_ROW between them and the whole block is centered in the zone inner height.
 * Every node in a `(row, col)` cell shares its column's center-X and its row's
 * center-Y (center alignment — heights may differ).
 *
 * SINGLE-COLUMN zones (all `col` 0/absent) reduce EXACTLY to the previous vertical
 * stack (each single-node row centered on innerCx), so already-migrated lessons
 * render pixel-for-pixel. Overflow shrinks column widths toward the ladder min,
 * then throws if the column block still cannot fit.
 */
function layoutZone(
  zid: string,
  zone: Zone,
  zNodes: DiagramNode[],
  sizeOf: (id: string) => { w: number; h: number },
  placed: Map<string, Placed>,
): void {
  const innerX = zone.x + PAD;
  const innerY = zone.y + PAD;
  const innerW = zone.w - 2 * PAD;
  const innerH = zone.h - 2 * PAD;
  const innerCx = innerX + innerW / 2;

  interface Item {
    node: DiagramNode;
    w: number;
    h: number;
  }
  // ---- group nodes into cells keyed by "row:col" ----
  const cells = new Map<string, Item[]>();
  const rowSet = new Set<number>();
  const colSet = new Set<number>();
  for (const n of zNodes) {
    const at = n.at as { zone: string; row: number; col?: number };
    const r = at.row;
    const c = at.col == null ? 0 : at.col;
    rowSet.add(r);
    colSet.add(c);
    const s = sizeOf(n.id);
    const key = r + ":" + c;
    const arr = cells.get(key);
    if (arr) arr.push({ node: n, w: s.w, h: s.h });
    else cells.set(key, [{ node: n, w: s.w, h: s.h }]);
  }
  const rowKeys = Array.from(rowSet).sort((a, b) => a - b);
  const colKeys = Array.from(colSet).sort((a, b) => a - b);
  // sub-row order within a cell = array order (nodes already appended in source order)

  // A cell's natural width = Σ node widths + GUTTER_CROSS between them.
  const cellW = (items: Item[] | undefined): number => (items ? sumW(items) : 0);

  // ---- per-column natural width = MAX cell width over rows; then overflow shrink ----
  let colW = new Map<number, number>();
  for (const c of colKeys) {
    let w = 0;
    for (const r of rowKeys) w = Math.max(w, cellW(cells.get(r + ":" + c)));
    colW.set(c, w);
  }
  const blockW = () => colKeys.reduce((s, c) => s + colW.get(c)!, 0) + GUTTER_CROSS * (colKeys.length - 1);

  // OVERFLOW: if the column block is wider than the inner box, shrink node widths DOWN
  // the ladder (stays WIDTH-ON-LADDER) so the block fits (minus SNAP_SLACK so a
  // centered+snapped box never crosses the PAD boundary). If the ladder floor still
  // can't fit → THROW an authoring error (surfaced, never a silent visual bug).
  const SNAP_SLACK = 2;
  if (blockW() > innerW - SNAP_SLACK) {
    // Count the max node-boxes across any single column-block cross-section: the widest
    // cross-section (Σ over columns of that column's widest cell's node count) bounds
    // how small we may go. We scale every node width by one global factor, then snap
    // each DOWN to a ladder rung.
    const maxNodesPerColumn = colKeys.reduce((s, c) => {
      let m = 0;
      for (const r of rowKeys) m = Math.max(m, (cells.get(r + ":" + c) || []).length);
      return s + m;
    }, 0);
    const totalGutters = GUTTER_CROSS * (colKeys.length - 1) + GUTTER_CROSS * (maxNodesPerColumn - colKeys.length);
    const availForBoxes = innerW - SNAP_SLACK - totalGutters;
    // current sum of the widest cross-section's box widths (no gutters)
    let curBoxes = 0;
    for (const c of colKeys) {
      let widestCellBoxes = 0;
      for (const r of rowKeys) {
        const items = cells.get(r + ":" + c);
        if (items) widestCellBoxes = Math.max(widestCellBoxes, sumBoxW(items));
      }
      curBoxes += widestCellBoxes;
    }
    if (availForBoxes >= maxNodesPerColumn * W_LADDER_MIN && curBoxes > 0) {
      const scale = Math.min(1, availForBoxes / curBoxes);
      for (const [, items] of cells) for (const it of items) it.w = ladderDown(it.w * scale);
      colW = recomputeColW(cells, rowKeys, colKeys, cellW);
      // A single wide box may still exceed avail after ladder rounding up a notch; step
      // the widest boxes down one more rung until the block fits (or we hit the floor).
      let guard = 0;
      while (blockW() > innerW - SNAP_SLACK && guard++ < 12) {
        let steppedAny = false;
        for (const [, items] of cells)
          for (const it of items)
            if (it.w > W_LADDER_MIN) {
              it.w = ladderStepDown(it.w);
              steppedAny = true;
            }
        colW = recomputeColW(cells, rowKeys, colKeys, cellW);
        if (!steppedAny) break;
      }
    }
    if (blockW() > innerW - SNAP_SLACK + 0.5) {
      throw new Error(`layout: zone '${zid}' columns overflow (need ${Math.ceil(blockW())}u, inner width ${innerW}u)`);
    }
  }

  // ---- per-column center-X: the whole block centered in the inner box ----
  const colCx = new Map<number, number>();
  {
    let x = innerCx - blockW() / 2;
    for (const c of colKeys) {
      const w = colW.get(c)!;
      colCx.set(c, x + w / 2);
      x += w + GUTTER_CROSS;
    }
  }

  // ---- per-row height = MAX node height in the row ----
  const rowH = new Map<number, number>();
  for (const r of rowKeys) {
    let h = 0;
    for (const c of colKeys)
      for (const it of cells.get(r + ":" + c) || []) h = Math.max(h, it.h);
    rowH.set(r, h);
  }

  // ---- vertical: total block height = Σ rowH + GUTTER_ROW·(rows-1); center in inner ----
  const totalH = rowKeys.reduce((s, r) => s + rowH.get(r)!, 0) + GUTTER_ROW * (rowKeys.length - 1);
  let clip = false;
  let cursorY: number;
  if (totalH <= innerH) {
    cursorY = innerY + (innerH - totalH) / 2; // centered
  } else {
    cursorY = innerY; // top-align on overflow
    clip = true;
  }

  // ---- place every node in its cell: sub-row centered on the column center-X,
  // sharing the row center-Y ----
  for (const r of rowKeys) {
    const centerY = snap(cursorY + rowH.get(r)! / 2);
    for (const c of colKeys) {
      const items = cells.get(r + ":" + c);
      if (!items) continue;
      const cx0 = colCx.get(c)!;
      const subW = cellW(items);
      let x = cx0 - subW / 2; // center the sub-row on the column center-X
      for (const it of items) {
        const cx = snap(x + it.w / 2);
        placed.set(it.node.id, { node: it.node, cx, cy: centerY, w: it.w, h: it.h });
        x += it.w + GUTTER_CROSS;
      }
    }
    cursorY += rowH.get(r)! + GUTTER_ROW;
  }

  if (clip) {
    throw new Error(
      `layout: zone '${zid}' rows are taller (${Math.ceil(totalH)}u) than the inner height (${innerH}u) — remove a row or enlarge the zone`,
    );
  }
}

/** Recompute per-column widths (max cell width over rows) after an overflow shrink. */
function recomputeColW<T extends { w: number }>(
  cells: Map<string, T[]>,
  rowKeys: number[],
  colKeys: number[],
  cellW: (items: T[] | undefined) => number,
): Map<number, number> {
  const out = new Map<number, number>();
  for (const c of colKeys) {
    let w = 0;
    for (const r of rowKeys) w = Math.max(w, cellW(cells.get(r + ":" + c)));
    out.set(c, w);
  }
  return out;
}

/**
 * Stack nested children inside a positioned parent: below the header band (or PAD
 * when the parent has no typeTag), inset by PAD left/right, centered horizontally
 * on the parent, with NEST_GAP between children. The parent was already grown to
 * contain them, so this always fits.
 */
function layoutNested(
  parent: Placed,
  kids: DiagramNode[],
  sizeOf: (id: string) => { w: number; h: number },
  placed: Map<string, Placed>,
): void {
  const header = parent.node.typeTag ? HEADER_H : PAD;
  const top = parent.cy - parent.h / 2 + header;
  // Nested children fill the parent's inner width (parent − 2·PAD), snapped DOWN to
  // a ladder rung so a slot/ref has room for its name gutter + value and never
  // pokes out of the parent. They stack centered on the parent's center-X.
  const innerW = parent.w - 2 * PAD;
  const childW = ladderDown(innerW);
  let y = top;
  for (const k of kids) {
    const s = sizeOf(k.id);
    const cy = snap(y + s.h / 2);
    placed.set(k.id, { node: k, cx: snap(parent.cx), cy, w: childW, h: s.h });
    y += s.h + NEST_GAP;
  }
}

function sumW(items: { w: number }[]): number {
  return items.reduce((s, it) => s + it.w, 0) + GUTTER_CROSS * (items.length - 1);
}
function sumBoxW(items: { w: number }[]): number {
  return items.reduce((s, it) => s + it.w, 0);
}
function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), Math.max(lo, hi));
}
/** Widest ladder rung ≤ v (never below the ladder min). Keeps shrunk widths on-ladder. */
function ladderDown(v: number): number {
  let best = W_LADDER[0] as number;
  for (const rung of W_LADDER) if ((rung as number) <= v) best = rung as number;
  return best;
}
/** One ladder rung below the given (on-ladder) width; clamps at the ladder min. */
function ladderStepDown(w: number): number {
  let prev = W_LADDER[0] as number;
  for (const rung of W_LADDER) {
    if ((rung as number) >= w) return prev;
    prev = rung as number;
  }
  return prev;
}

/**
 * viewBox "minX minY W H" → {vbW,vbH} for the escape-hatch clamp. Prefers the real
 * segment viewBox (passed from the player) so an explicit node is clamped to the
 * ACTUAL frame, not an underestimate; falls back to the zone union / 340×210.
 */
function parseViewBox(viewBox: string | undefined, zones: Zone[]): { vbW: number; vbH: number } {
  if (viewBox) {
    const p = viewBox.trim().split(/[\s,]+/).map(Number);
    if (p.length === 4 && p.every((n) => !Number.isNaN(n))) return { vbW: p[2], vbH: p[3] };
  }
  let vbW = 340;
  let vbH = 210;
  for (const z of zones) {
    vbW = Math.max(vbW, z.x + z.w);
    vbH = Math.max(vbH, z.y + z.h);
  }
  return { vbW, vbH };
}

/** Re-export GRID so callers can assert the snap contract. */
export { GRID as LAYOUT_GRID };
