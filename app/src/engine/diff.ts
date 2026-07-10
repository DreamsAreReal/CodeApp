/**
 * Keyed data-join diff + FLIP planning. Compares two VNode trees by child
 * `key` to classify enter / update / exit, and computes transform-only moves
 * (First-Last-Invert-Play) for nodes that persist but change position.
 */
import type { DiffResult, FlipMove, VNode } from "./types.ts";

function childKeys(v: VNode | null): string[] {
  return !v || !v.children ? [] : v.children.map((c) => c.key);
}

export function diff(prev: VNode | null, next: VNode): DiffResult {
  const pk = childKeys(prev);
  const nk = childKeys(next);
  const pset: Record<string, 1> = {};
  const nset: Record<string, 1> = {};
  for (const k of pk) pset[k] = 1;
  for (const k of nk) nset[k] = 1;

  const enter: string[] = [];
  const update: string[] = [];
  const exit: string[] = [];
  for (const k of nk) (pset[k] ? update : enter).push(k);
  for (const k of pk) if (!nset[k]) exit.push(k);
  return { enter: enter.sort(), update: update.sort(), exit: exit.sort() };
}

function positions(v: VNode | null): Record<string, { x: number; y: number }> {
  const out: Record<string, { x: number; y: number }> = {};
  const ch = (v && v.children) || [];
  for (const c of ch) {
    const t = String(c.attrs.transform || "");
    const m = /translate\(([-\d.]+),([-\d.]+)\)/.exec(t);
    if (m) out[c.key] = { x: +m[1], y: +m[2] };
  }
  return out;
}

export function planFlip(prev: VNode, next: VNode, d: DiffResult): FlipMove[] {
  const pp = positions(prev);
  const np = positions(next);
  const moves: FlipMove[] = [];
  for (const k of d.update) {
    const p = pp[k];
    const n = np[k];
    if (!p || !n) continue;
    const dx = p.x - n.x;
    const dy = p.y - n.y;
    if (dx !== 0 || dy !== 0) moves.push({ key: k, dx, dy });
  }
  return moves;
}
