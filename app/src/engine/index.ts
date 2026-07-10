/**
 * Living-diagram engine — public surface (RS-08).
 * Reusable, typed, zero-dependency. Extracted from concepts/lesson-boxing.
 *
 * The SAME engine renders every segment animation in every lesson:
 *   Scene (data) -> render -> keyed data-join diff -> FLIP -> StepPlayer -> VizPlayer (DOM).
 */
export * from "./types.ts";
export { render, renderNode } from "./render.ts";
export { diff, planFlip } from "./diff.ts";
export { StepPlayer } from "./stepPlayer.ts";
export { VizPlayer } from "./vizPlayer.ts";
export type { VizConfig, VizElements, VizUi, VizState } from "./vizPlayer.ts";
export { hlCode, esc } from "./hlcode.ts";
export { ICON } from "./icons.ts";
export { prefersReducedMotion } from "./dom.ts";
