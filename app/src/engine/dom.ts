/** Small DOM/SVG helpers + motion policy for the engine's DOM adapter. */
import type { VNode } from "./types.ts";

export const SVGNS = "http://www.w3.org/2000/svg";

/**
 * Honour the user's reduced-motion preference. True when ANY of:
 *   - the OS `prefers-reduced-motion: reduce` media query matches;
 *   - the `?reduced=1` URL override is present (used by verification harnesses);
 *   - the in-app "Меньше движения" toggle is ON (persisted at localStorage `codex.reducedMotion`
 *     = "1" by app/settings.ts). The key is read directly here — not imported — so the engine
 *     stays a standalone layer with no dependency on app/. The lesson runner re-reads this on
 *     every render, so flipping the toggle in Profile silences a lesson's animations on reopen.
 */
export function prefersReducedMotion(): boolean {
  return (
    (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches) ||
    /(?:\?|&)reduced=1(?:&|$)/.test(location.search) ||
    reducedMotionToggleOn()
  );
}

/** Read the persisted in-app reduce-motion toggle (settings.ts key). Storage-safe. */
function reducedMotionToggleOn(): boolean {
  try {
    return localStorage.getItem("codex.reducedMotion") === "1";
  } catch {
    return false;
  }
}

export interface Durations {
  enter: number;
  flip: number;
  exit: number;
  flash: number;
}

export function durations(reduced: boolean): Durations {
  return reduced ? { enter: 0, flip: 0, exit: 0, flash: 0 } : { enter: 380, flip: 620, exit: 300, flash: 600 };
}

/** Realise a VNode as a real SVG element (deep). */
export function svgEl(vnode: VNode): SVGElement {
  const e = document.createElementNS(SVGNS, vnode.tag) as SVGElement;
  for (const k in vnode.attrs) e.setAttribute(k, String(vnode.attrs[k]));
  if (vnode.text != null) e.textContent = String(vnode.text);
  const ch = vnode.children || [];
  for (const c of ch) e.appendChild(svgEl(c));
  return e;
}

/** Read the translate() base position encoded in a VNode's transform. */
export function baseXY(vnode: VNode): { x: number; y: number } {
  const m = /translate\(([-\d.]+),([-\d.]+)\)/.exec(String(vnode.attrs.transform || ""));
  return m ? { x: +m[1], y: +m[2] } : { x: 0, y: 0 };
}

/**
 * Canvas-backed text measurer for `sizeNode` — uses the SAME fonts the SVG renders
 * with (mono for values, the display/Rubik stack for zone text), so the auto-derived
 * ladder rung reflects real glyph advance, not the deterministic 0.6·fontSize
 * fallback. Falls back to that estimate if a 2D canvas is unavailable (headless).
 */
let _ctx: CanvasRenderingContext2D | null | undefined;
function measureCtx(): CanvasRenderingContext2D | null {
  if (_ctx !== undefined) return _ctx;
  try {
    _ctx = document.createElement("canvas").getContext("2d");
  } catch {
    _ctx = null;
  }
  return _ctx;
}
function fontFamily(varName: string, fallback: string): string {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return v || fallback;
  } catch {
    return fallback;
  }
}
export function domMeasure(text: string, fontSize: number, mono: boolean): number {
  if (!text) return 0;
  const ctx = measureCtx();
  if (!ctx) return text.length * fontSize * 0.6;
  const fam = mono
    ? fontFamily("--mono", "ui-monospace, monospace")
    : fontFamily("--display", "system-ui, sans-serif");
  ctx.font = `700 ${fontSize}px ${fam}`;
  return ctx.measureText(text).width;
}
