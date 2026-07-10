/** Small DOM/SVG helpers + motion policy for the engine's DOM adapter. */
import type { VNode } from "./types.ts";

export const SVGNS = "http://www.w3.org/2000/svg";

/** Honour the user's reduced-motion preference (also forceable via ?reduced=1). */
export function prefersReducedMotion(): boolean {
  return (
    (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches) ||
    /(?:\?|&)reduced=1(?:&|$)/.test(location.search)
  );
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
