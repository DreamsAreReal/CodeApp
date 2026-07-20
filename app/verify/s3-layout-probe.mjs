/**
 * Pure-engine layout probe for the S3 (LINQ) lessons — runs the REAL layoutScene
 * (no browser) over every scene of one lesson and asserts CLIP (every node box inside
 * the segment viewBox) and OVERLAP (no two node boxes cross beyond a 1px tolerance).
 * Mirrors the geometry checks in verify/viz-fit.mjs but without needing a running app,
 * so a lesson can be self-passed offline. Usage:
 *   node verify/s3-layout-probe.mjs cs/linq-query-syntax.ts linqQuerySyntax
 */
import { layoutScene } from "../src/engine/layout.ts";

const CLIP_TOL = 1;
const OVL_TOL = 1;

const rel = process.argv[2];
const exportName = process.argv[3];
if (!rel || !exportName) {
  console.error("usage: node verify/s3-layout-probe.mjs <cs/slug.ts> <exportName>");
  process.exit(2);
}

const mod = await import(`../src/lessons/${rel}`);
const lesson = mod[exportName];
if (!lesson) {
  console.error(`no export '${exportName}' in ${rel}`);
  process.exit(2);
}

let violations = 0;
const overlaps = (a, b) => {
  const ax2 = a.x + a.w, ay2 = a.y + a.h, bx2 = b.x + b.w, by2 = b.y + b.h;
  const ix = Math.min(ax2, bx2) - Math.max(a.x, b.x);
  const iy = Math.min(ay2, by2) - Math.max(a.y, b.y);
  if (ix <= OVL_TOL || iy <= OVL_TOL) return false; // not crossing on both axes
  // containment (nesting) is exempt
  const aInB = a.x >= b.x - OVL_TOL && a.y >= b.y - OVL_TOL && ax2 <= bx2 + OVL_TOL && ay2 <= by2 + OVL_TOL;
  const bInA = b.x >= a.x - OVL_TOL && b.y >= a.y - OVL_TOL && bx2 <= ax2 + OVL_TOL && by2 <= ay2 + OVL_TOL;
  return !(aInB || bInA);
};

for (const seg of lesson.segments) {
  const vb = seg.viewBox.split(/\s+/).map(Number); // [x y w h]
  const [, , vbW, vbH] = vb;
  seg.scenes.forEach((scene, si) => {
    const laid = layoutScene(scene, seg.zones ?? [], undefined, seg.viewBox);
    // layoutScene writes back x/y as the node CENTER (see engine/layout.ts write-back);
    // convert to top-left for the CLIP/OVERLAP box math.
    const boxes = laid.nodes.map((n) => ({ id: n.id, x: n.x - n.w / 2, y: n.y - n.h / 2, w: n.w, h: n.h }));
    for (const bx of boxes) {
      if (bx.x < -CLIP_TOL || bx.y < -CLIP_TOL || bx.x + bx.w > vbW + CLIP_TOL || bx.y + bx.h > vbH + CLIP_TOL) {
        violations++;
        console.log(`  CLIP  ${lesson.id} ${seg.id} scene#${si} node '${bx.id}' box=(${bx.x},${bx.y},${bx.w},${bx.h}) vb=(${vbW}x${vbH})`);
      }
    }
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++)
        if (overlaps(boxes[i], boxes[j])) {
          violations++;
          console.log(`  OVERLAP ${lesson.id} ${seg.id} scene#${si} '${boxes[i].id}' x '${boxes[j].id}'`);
        }
  });
}

if (violations === 0) console.log(`ALL GREEN — ${lesson.id}: ${lesson.segments.length} segments, 0 clip/overlap`);
else {
  console.log(`FAIL — ${lesson.id}: ${violations} violations`);
  process.exit(1);
}
