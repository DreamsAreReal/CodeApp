/**
 * Deterministic step player: holds the ordered scenes and, on `goto(i)`,
 * produces the render tree + diff + FLIP plan relative to the previous frame.
 * Pure w.r.t. the DOM — the VizPlayer applies the result.
 */
import { diff, planFlip } from "./diff.ts";
import { render } from "./render.ts";
import type { Scene, StepResult, VNode } from "./types.ts";

export class StepPlayer {
  readonly steps: Scene[];
  private reducedMotion: boolean;
  i = 0;
  private prevTree: VNode | null = null;

  constructor(steps: Scene[], opts: { reducedMotion?: boolean } = {}) {
    this.steps = steps;
    this.reducedMotion = !!opts.reducedMotion;
  }

  goto(i: number): StepResult {
    i = Math.max(0, Math.min(this.steps.length - 1, i));
    const tree = render(this.steps[i]);
    const d = diff(this.prevTree, tree);
    const flip = this.reducedMotion ? [] : this.prevTree ? planFlip(this.prevTree, tree, d) : [];
    this.i = i;
    this.prevTree = tree;
    return { tree, diff: d, flip };
  }
}
