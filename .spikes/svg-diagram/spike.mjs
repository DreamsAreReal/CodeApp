// Spike: verify the load-bearing math for a clean SVG diagram engine.
// 1) monospace text measurement + box auto-sizing
// 2) orthogonal connector with rounded corners (arc command)
// 3) line->rectangle border intersection (edges touch borders, not centers)
// 4) grid snapping + crisp half-pixel offset
// Output: an actual SVG file we can eyeball + numeric assertions.

import { writeFileSync } from "node:fs";

// ---------- 1. MONOSPACE TEXT MEASUREMENT ----------
// JetBrains Mono advance width. For monospace, every glyph = same advance.
// Published metric for JetBrains Mono: advance width = 600 units / 1000 UPM = 0.6em.
const MONO_ADVANCE = 0.6; // em, per JetBrains Mono font metrics (units-per-em=1000, advanceWidth=600)

function measureMono(text, fontSizePx) {
  return text.length * MONO_ADVANCE * fontSizePx;
}

// Auto-size a box to its (single-line) content with padding.
function sizeBox(text, fontSizePx, padX, padY, minW, minH) {
  const textW = measureMono(text, fontSizePx);
  // cap height = ~0.72em for mono, line height ~1.0em is enough for one line
  const lineH = fontSizePx * 1.0;
  const w = Math.max(minW, Math.ceil(textW + 2 * padX));
  const h = Math.max(minH, Math.ceil(lineH + 2 * padY));
  return { w, h, textW };
}

// Greedy word-wrap into N lines that fit maxTextWidth, then size box to widest line.
function wrapMono(text, fontSizePx, maxTextW) {
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const word of words) {
    const trial = cur ? cur + " " + word : word;
    if (measureMono(trial, fontSizePx) <= maxTextW || !cur) {
      cur = trial;
    } else {
      lines.push(cur);
      cur = word;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// ---------- 4. GRID SNAP + CRISP OFFSET ----------
const GRID = 2; // snap all node coords to multiples of 2 -> even stroke stays crisp
const snap = (v) => Math.round(v / GRID) * GRID;
// For a 1px (odd) stroke on H/V lines, add 0.5 so the stroke centers on a pixel.
const crisp = (v) => snap(v) + 0.5;

// ---------- 2. ROUNDED ORTHOGONAL CONNECTOR ----------
// Route source-right -> target-left with a mid vertical jog, rounded corners radius r.
// Only H and V segments. Corner rounded via elliptical arc A r r 0 0 sweep x y.
function orthPath(x1, y1, x2, y2, r) {
  const midX = snap((x1 + x2) / 2);
  // clamp radius so it never exceeds half of any segment it sits on
  const seg1 = Math.abs(midX - x1);
  const seg2 = Math.abs(y2 - y1) / 2;
  const seg3 = Math.abs(x2 - midX);
  const rr = Math.max(0, Math.min(r, seg1, seg2, seg3));
  const downSweep = y2 > y1 ? 1 : 0;
  const dir = y2 > y1 ? 1 : -1;
  // horizontal to just before corner, arc down, vertical, arc to horizontal, finish
  return [
    `M ${x1} ${y1}`,
    `H ${midX - rr}`,
    `A ${rr} ${rr} 0 0 ${downSweep} ${midX} ${y1 + dir * rr}`,
    `V ${y2 - dir * rr}`,
    `A ${rr} ${rr} 0 0 ${downSweep === 1 ? 0 : 1} ${midX + rr} ${y2}`,
    `H ${x2}`,
  ].join(" ");
}

// ---------- 3. LINE -> RECT BORDER INTERSECTION ----------
// Given box center + half-size and a target point, find where the ray from center
// exits the box border. Standard "slab" method.
function borderPoint(cx, cy, hw, hh, tx, ty) {
  const dx = tx - cx, dy = ty - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  // scale factor to hit vertical vs horizontal edge; take the nearer edge
  const sx = dx !== 0 ? hw / Math.abs(dx) : Infinity;
  const sy = dy !== 0 ? hh / Math.abs(dy) : Infinity;
  const s = Math.min(sx, sy);
  return { x: cx + dx * s, y: cy + dy * s };
}

// ---------- RUN + ASSERT ----------
const results = [];
function assert(name, cond, detail) {
  results.push({ name, pass: !!cond, detail });
}

// text measurement
const b1 = sizeBox("Thread-1", 11, 10, 6, 60, 32);
const b2 = sizeBox("main()", 11, 10, 6, 60, 32);
// both boxes must be same HEIGHT (consistency) though different widths
assert("boxes share height", b1.h === b2.h, `h1=${b1.h} h2=${b2.h}`);
assert("wider text -> wider box", b1.w > b2.w, `w1=${b1.w} w2=${b2.w}`);
// a very long label must wrap, not overflow
const longW = 140;
const lines = wrapMono("acquire mutex lock then release", 11, longW - 20);
const widest = Math.max(...lines.map((l) => measureMono(l, 11)));
assert("wrapped lines fit width", widest <= longW - 20 + 0.001, `widest=${widest.toFixed(1)} max=${longW - 20}`);
assert("wrapping produced >1 line", lines.length > 1, `lines=${lines.length}`);

// border intersection: edge from box center must land ON the border, not center
const bp = borderPoint(50, 50, 30, 16, 200, 60);
const onBorder = Math.abs(Math.abs(bp.x - 50) - 30) < 0.001 || Math.abs(Math.abs(bp.y - 50) - 16) < 0.001;
assert("edge endpoint lies on box border", onBorder, `bp=(${bp.x.toFixed(1)},${bp.y.toFixed(1)})`);

// grid snap
assert("snap to grid", snap(51) === 52 && snap(11) === 12, `snap(51)=${snap(51)} snap(11)=${snap(11)}`);
assert("crisp offset is .5", crisp(50) % 1 === 0.5, `crisp(50)=${crisp(50)}`);

// orth path: contains arcs (rounded) and only H/V line commands (no diagonal L)
const p = orthPath(80, 40, 260, 150, 8);
assert("orth path has rounded corners", /A /.test(p), p);
assert("orth path has no diagonal lineto", !/ L /.test(p), p);
assert("orth path uses H and V only", /H /.test(p) && /V /.test(p), p);

// ---------- EMIT SVG ARTIFACT ----------
const src = borderPoint(80, 40, 32, 16, 260, 150);
const tgt = borderPoint(260, 150, 40, 16, 80, 40);
const conn = orthPath(src.x, src.y, tgt.x, tgt.y, 8);

const svg = `<svg viewBox="-0.5 -0.5 340 210" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" shape-rendering="geometricPrecision">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0 0 L10 5 L0 10 z" fill="#E8846B"/>
    </marker>
  </defs>
  <rect x="8" y="8" width="324" height="194" rx="10" fill="#FBF6EF"/>
  <rect x="${snap(80 - 32)}" y="${snap(40 - 16)}" width="64" height="32" rx="6" fill="#fff" stroke="#E8846B" stroke-width="2"/>
  <text x="80" y="44" font-family="JetBrains Mono" font-size="11" text-anchor="middle" fill="#333">Thread-1</text>
  <rect x="${snap(260 - 40)}" y="${snap(150 - 16)}" width="80" height="32" rx="6" fill="#fff" stroke="#9CAF88" stroke-width="2"/>
  <text x="260" y="154" font-family="JetBrains Mono" font-size="11" text-anchor="middle" fill="#333">acquire()</text>
  <path d="${conn}" fill="none" stroke="#333" stroke-width="1.5" marker-end="url(#arrow)"/>
</svg>`;

writeFileSync(new URL("./out.svg", import.meta.url), svg);

console.log("CONNECTOR PATH:", conn);
console.log("SRC border pt:", src, "TGT border pt:", tgt);
console.log("Box1:", b1, "Box2:", b2);
console.log("Wrapped lines:", lines);
console.log("---- ASSERTIONS ----");
let ok = 0;
for (const r of results) {
  console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.name}  [${r.detail}]`);
  if (r.pass) ok++;
}
console.log(`\n${ok}/${results.length} passed`);
process.exit(ok === results.length ? 0 : 1);
