/**
 * Headless verification for the living-diagram FIT + CLIP fix (viz-fit).
 * Reuses the Playwright/Chromium + dev-auth pattern from run.mjs. Against the
 * LIVE backend (:5080) + preview (:4173), for EVERY lesson in the registry (all
 * 6) and EVERY segment, it opens the lesson, forces every segment to its final
 * frame (window.__viz.forcePlayAll()), then measures the SETTLED SVG in user
 * units and asserts:
 *
 *   (1) FIT — no node <text> has getComputedTextLength() greater than its box
 *       region's available width (+1px tolerance). Region widths mirror
 *       render.ts / the engine fitLabels pass: obj/chip/gate labels span the
 *       whole box (w-10); slot/ref NAME sits in the left region (38-8); slot
 *       value / ref value sit in the right region (w-38-8). Proves labels fit.
 *   (2) CLIP — every node rect's bounding box (translate(x,y) + rect x/y/w/h,
 *       read as SVG user units) lies within [0,vbW] x [0,vbH] with a small
 *       tolerance. Proves nothing clips the segment viewBox.
 *   (3) OVERLAP — no two node boxes in the same scene overlap (beyond a 1px
 *       touching tolerance). Proves the layout stays legible.
 *
 * Every violation is reported with lesson id + segment id + node id. Prints
 * `ALL GREEN` only when there are ZERO violations across all 6 lessons.
 *
 * Requires: backend on :5080, `npm run build && npm run preview` on :4173.
 * Captures element-screenshots of the previously-broken segments into
 * docs/evidence/viz-fit/ for a human eyeball.
 */
import { chromium } from "playwright";
import { evidenceDir, preflight } from "./_util.mjs";
import { PROBE_SRC } from "./_anim-overlap-probe.mjs";
// Auto-layout v2 (engine) + the lesson registry, imported directly (node strips the
// TS types) so the AUTHORING-PROOF runs the REAL layoutScene the app runs.
import { layoutScene } from "../src/engine/layout.ts";
import { LESSONS as LESSON_DATA } from "../src/lessons/index.ts";

const APP = process.env.APP_BASE || "http://localhost:4173";
const API = process.env.VITE_API_BASE || "http://localhost:5080";
// CI-portable evidence dir: $EVIDENCE_DIR/viz-fit on CI, else repo-relative (no hardcoded path).
const EV = evidenceDir("viz-fit");
const RUN_USER = 700000 + Math.floor(Math.random() * 90000);

// All six lessons in the registry (curriculum order), with segment counts.
const LESSONS = [
  { id: "T1.M2.value-vs-reference", segs: 4 },
  { id: "T1.M3.boxing", segs: 7 },
  { id: "T1.M4.gc", segs: 6 },
  { id: "T2.M2.closures", segs: 5 },
  { id: "T2.M1.async-await", segs: 5 },
  { id: "T2.M5.hashtable", segs: 6 },
];

// Element-screenshots of the previously-broken segments (id -> stage index, filename).
const SHOTS = {
  "T2.M1.async-await": [
    { seg: 0, file: "async-await-s1-state-machine" },
    { seg: 1, file: "async-await-s2-await-block" },
    { seg: 4, file: "async-await-s5-deadlock" },
  ],
  "T1.M4.gc": [
    { seg: 0, file: "gc-s1-heap" },
    { seg: 1, file: "gc-s2-generations" },
    { seg: 2, file: "gc-s3-trigger" },
    { seg: 3, file: "gc-s4-promotion" },
    { seg: 4, file: "gc-s5-phases" },
    { seg: 5, file: "gc-s6-loh" },
  ],
  "T2.M5.hashtable": [
    { seg: 2, file: "hashtable-s3-hash-key" },
    { seg: 3, file: "hashtable-s4-worst-case" },
    { seg: 4, file: "hashtable-s5-resize" },
    { seg: 5, file: "hashtable-s6-bucket" },
  ],
};

const FIT_TOL = 1; // px tolerance on getComputedTextLength vs available
const CLIP_TOL = 0.75; // px tolerance on rect bbox vs viewBox

const log = (m) => console.log(m);
let failed = 0;
function assert(cond, msg) {
  if (cond) log("  ✓ " + msg);
  else {
    failed++;
    log("  ✗ FAIL: " + msg);
  }
}

let apiToken = null;
async function authApi() {
  const res = await fetch(API + "/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ devUserId: RUN_USER }),
  });
  apiToken = (await res.json()).token;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Runs INSIDE the page. For the currently-open lesson, measures every settled
 * segment SVG and returns { fit, clip, overlap } violation lists with the same
 * region math the engine fitLabels pass uses (plus a per-scene box-overlap check).
 */
function measureInPage(lessonId) {
  const fit = [];
  const clip = [];
  const overlap = [];
  // ---- NEW design-system checks (viz-design-spec.md) ----
  const height = []; // HEIGHT-IN-SCALE  : rect height ∈ {28,40,44,48,60}
  const width = []; //  WIDTH-ON-LADDER  : rect width ∈ {56,72,96,120,144,168}
  const grid = []; //   GRID-SNAP        : x,y,w,h even
  const ortho = []; //  EDGE-ORTHOGONAL  : each drawn segment axis-aligned (except arcs)
  const port = []; //   EDGE-PORT-ON-BORDER : edge first/last point on a node border
  const bend = []; //   BEND-COUNT ≤3
  const row = []; //    ROW-BASELINE     : near-equal centerY ⇒ identical y + height
  const rxc = []; //    RX-CONSISTENT    : one rx per kind
  const strk = []; //   STROKE-CONSISTENT: box kinds share width; solid edges share width

  const FIT_TOL = 1;
  const CLIP_TOL = 0.75;
  const OVL_TOL = 1; // px: ignore ≤1px touching edges (adjacent boxes may share a border)
  const H_ALLOW = [28, 40, 44, 48, 60];
  const W_ALLOW = [56, 72, 96, 120, 144, 168];
  const ROW_TOL = 6; // centers within this Y are "the same row"
  const PORT_TOL = 1; // edge endpoint must sit within this of a node border
  const stages = document.querySelectorAll(".stage");
  const segIds = Object.keys(window.__viz.vizByKey);
  stages.forEach((stage, si) => {
    const segId = segIds[si] || "seg" + si;
    const svg = stage.querySelector("svg");
    if (!svg) return;
    const vb = svg.viewBox.baseVal; // {x,y,width,height}
    const vbW = vb.width;
    const vbH = vb.height;
    const nodes = svg.querySelectorAll("g.node");
    const boxes = []; // {id, x0,y0,x1,y1} for the per-scene overlap check
    const rxByKind = {}; // kind -> rx (RX-CONSISTENT)
    const strokeByKind = {}; // kind -> stroke-width (STROKE-CONSISTENT)
    const metrics = []; // {id, kind, w, h, cy} for ROW-BASELINE
    nodes.forEach((g) => {
      // node id lives in the group key "n:<id>" — recover it from the transform
      // group; we tagged nothing else, so read it from the render key via a data hook.
      const rect = g.querySelector("rect");
      if (!rect) return;
      const nodeId = g.getAttribute("data-node") || rectNodeId(g);
      const w = parseFloat(rect.getAttribute("width") || "0");
      const h = parseFloat(rect.getAttribute("height") || "0");
      const rx = parseFloat(rect.getAttribute("x") || "0");
      const ry = parseFloat(rect.getAttribute("y") || "0");
      const rxRadius = parseFloat(rect.getAttribute("rx") || "0");
      const sw = parseFloat(getComputedStyle(rect).strokeWidth) || 0;
      // node kind: second class token of the group ("node <kind> …")
      const cls0 = g.getAttribute("class") || "";
      const kind = (cls0.split(/\s+/)[1] || "?");
      // node translate
      const tr = g.transform.baseVal.consolidate();
      const tx = tr ? tr.matrix.e : 0;
      const ty = tr ? tr.matrix.f : 0;
      // ---- CLIP: rect bbox in SVG user units ----
      const x0 = tx + rx;
      const y0 = ty + ry;
      const x1 = x0 + w;
      const y1 = y0 + h;
      boxes.push({ id: nodeId, x0, y0, x1, y1 });
      metrics.push({ id: nodeId, kind, w, h, cy: (y0 + y1) / 2 });
      // ---- HEIGHT-IN-SCALE ----
      if (!H_ALLOW.includes(Math.round(h))) height.push({ lesson: lessonId, seg: segId, node: nodeId, h: round(h) });
      // ---- WIDTH-ON-LADDER ----
      if (!W_ALLOW.includes(Math.round(w))) width.push({ lesson: lessonId, seg: segId, node: nodeId, w: round(w) });
      // ---- GRID-SNAP (x,y,w,h even; use the rect's absolute box) ----
      for (const [k, v] of [["x", x0], ["y", y0], ["w", w], ["h", h]]) {
        if (Math.round(v) % 2 !== 0) grid.push({ lesson: lessonId, seg: segId, node: nodeId, coord: k, val: round(v) });
      }
      // ---- RX-CONSISTENT (one rx per kind within a scene) ----
      if (rxByKind[kind] == null) rxByKind[kind] = rxRadius;
      else if (Math.abs(rxByKind[kind] - rxRadius) > 0.01)
        rxc.push({ lesson: lessonId, seg: segId, node: nodeId, kind, rx: round(rxRadius), expected: round(rxByKind[kind]) });
      // ---- STROKE-CONSISTENT (box kinds share stroke-width within a scene) ----
      if (strokeByKind[kind] == null) strokeByKind[kind] = sw;
      else if (Math.abs(strokeByKind[kind] - sw) > 0.05)
        strk.push({ lesson: lessonId, seg: segId, node: nodeId, kind, sw: round(sw), expected: round(strokeByKind[kind]) });
      if (x0 < -CLIP_TOL || y0 < -CLIP_TOL || x1 > vbW + CLIP_TOL || y1 > vbH + CLIP_TOL) {
        clip.push({
          lesson: lessonId,
          seg: segId,
          node: nodeId,
          box: [round(x0), round(y0), round(x1), round(y1)],
          vb: [vbW, vbH],
        });
      }
      // ---- FIT: each text vs its region available width ----
      const cls = g.getAttribute("class") || "";
      const divided = /(^|\s)(slot|ref)(\s|$)/.test(cls);
      const nameAvail = 38 - 8;
      const valAvail = w - 38 - 8;
      const fullAvail = w - 10;
      g.querySelectorAll("text").forEach((t) => {
        const tc = t.getAttribute("class") || "";
        let avail;
        let role;
        if (divided && /(^|\s)vz-name(\s|$)/.test(tc)) {
          avail = nameAvail;
          role = "name";
        } else if (divided && /(^|\s)(vz-val|vz-reflbl)(\s|$)/.test(tc)) {
          avail = valAvail;
          role = "value";
        } else {
          avail = fullAvail;
          role = "full";
        }
        let len = 0;
        try {
          len = t.getComputedTextLength();
        } catch (e) {
          void e;
          return;
        }
        // empty labels (len 0) can't overflow; a non-positive avail with real text is itself a bug
        if (len > 0 && len > avail + FIT_TOL) {
          fit.push({
            lesson: lessonId,
            seg: segId,
            node: nodeId,
            role,
            text: (t.textContent || "").slice(0, 40),
            len: round(len),
            avail: round(avail),
          });
        }
      });
    });
    // ---- OVERLAP: no two node boxes in the same scene PARTIALLY overlap ----
    // Partial overlap (two boxes crossing) is the bug class we fixed. A box fully
    // CONTAINED in another is intentional nesting (e.g. closures: a captured-field
    // `slot` drawn inside its DisplayClass `obj`) and is not flagged.
    const contains = (o, i) => o.x0 <= i.x0 + OVL_TOL && o.y0 <= i.y0 + OVL_TOL && o.x1 >= i.x1 - OVL_TOL && o.y1 >= i.y1 - OVL_TOL;
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
        const oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
        if (ox > OVL_TOL && oy > OVL_TOL && !contains(a, b) && !contains(b, a)) {
          overlap.push({
            lesson: lessonId,
            seg: segId,
            a: a.id,
            b: b.id,
            over: [round(ox), round(oy)],
          });
        }
      }
    }
    // ---- OVERLAP vs zone labels/sub-labels: a node box must not cover a zone caption ----
    svg.querySelectorAll(".vz-chrome text").forEach((t) => {
      let bb;
      try {
        bb = t.getBBox();
      } catch (e) {
        void e;
        return;
      }
      const l = { x0: bb.x, y0: bb.y, x1: bb.x + bb.width, y1: bb.y + bb.height };
      for (const a of boxes) {
        const ox = Math.min(a.x1, l.x1) - Math.max(a.x0, l.x0);
        const oy = Math.min(a.y1, l.y1) - Math.max(a.y0, l.y0);
        if (ox > OVL_TOL && oy > OVL_TOL) {
          overlap.push({
            lesson: lessonId,
            seg: segId,
            a: a.id,
            b: 'label"' + (t.textContent || "").slice(0, 18) + '"',
            over: [round(ox), round(oy)],
          });
        }
      }
    });

    // ---- ROW-BASELINE (auto-layout v2): two nodes in the SAME row share ONE
    // center-Y — CENTER alignment, so their HEIGHTS MAY DIFFER (a chip h28 and an
    // obj h44 in one row is legal in v2). We therefore only flag "almost aligned"
    // rows: center-Ys that are NEAR-equal (within ROW_TOL) but not identical — the
    // 61-vs-64 bug the engine now makes impossible. Exact-equal center-Y with
    // different heights is NOT a violation any more (that is the intended model).
    // EXEMPT: a node fully CONTAINED in another (nested display-class field slot). ----
    const rowContains = (o, i) => o.x0 <= i.x0 + OVL_TOL && o.y0 <= i.y0 + OVL_TOL && o.x1 >= i.x1 - OVL_TOL && o.y1 >= i.y1 - OVL_TOL;
    // A node fully contained in ANY other box is NESTED (its center-Y is set by its
    // parent's internal stacking, not by row alignment). Such nodes are excluded from
    // the row-pair comparison entirely — comparing a nested field slot's center-Y with
    // a far-away sibling box is meaningless (they are not a row).
    const nestedIdx = new Set();
    for (let i = 0; i < boxes.length; i++)
      for (let j = 0; j < boxes.length; j++)
        if (i !== j && rowContains(boxes[j], boxes[i])) nestedIdx.add(i);
    for (let i = 0; i < metrics.length; i++) {
      if (nestedIdx.has(i)) continue;
      for (let j = i + 1; j < metrics.length; j++) {
        if (nestedIdx.has(j)) continue;
        const a = metrics[i];
        const b = metrics[j];
        const ba = boxes[i];
        const bb = boxes[j];
        if (rowContains(ba, bb) || rowContains(bb, ba)) continue; // nested — not a row pair
        const dCy = Math.abs(a.cy - b.cy);
        if (dCy > 0.5 && dCy <= ROW_TOL) {
          row.push({ lesson: lessonId, seg: segId, a: a.id, b: b.id, cyA: round(a.cy), cyB: round(b.cy), reason: "center-Y" });
        }
      }
    }

    // ---- EDGE checks: parse each edge <path> d ----
    // ORTHOGONAL: every DRAWN segment (H/V and lineto) must be axis-aligned, EXCEPT
    //   corner arcs (A) — OR the whole path is a single straight segment only when its
    //   endpoints share x or y within 2u. Any free diagonal lineto fails.
    // PORT-ON-BORDER: the first and last path points must sit on SOME node border
    //   (within PORT_TOL), not at a node center.
    // BEND-COUNT: number of direction changes ≤ 3.
    const edgePaths = svg.querySelectorAll("path.edge");
    edgePaths.forEach((p) => {
      const dAttr = p.getAttribute("d") || "";
      const eid = p.getAttribute("data-edge") || "edge";
      const parsed = parsePath(dAttr); // {points:[{x,y,kind}], segs:[{axis}], bends}
      // ORTHOGONAL
      for (const s of parsed.segs) {
        if (s.axis === "diag") {
          ortho.push({ lesson: lessonId, seg: segId, edge: eid, d: dAttr.slice(0, 60) });
          break;
        }
      }
      // BEND-COUNT
      if (parsed.bends > 3) bend.push({ lesson: lessonId, seg: segId, edge: eid, bends: parsed.bends });
      // PORT-ON-BORDER: endpoints must be ON a node border (not a center)
      const first = parsed.points[0];
      const last = parsed.points[parsed.points.length - 1];
      for (const pt of [first, last]) {
        if (!pt) continue;
        if (!onAnyBorder(pt, boxes, PORT_TOL)) {
          port.push({ lesson: lessonId, seg: segId, edge: eid, pt: [round(pt.x), round(pt.y)] });
        }
      }
    });
  });
  function round(n) {
    return Math.round(n * 100) / 100;
  }
  // Is a point on the border (not interior, not center) of ANY node box?
  function onAnyBorder(pt, boxes, tol) {
    for (const bx of boxes) {
      const onLR = (Math.abs(pt.x - bx.x0) <= tol || Math.abs(pt.x - bx.x1) <= tol) && pt.y >= bx.y0 - tol && pt.y <= bx.y1 + tol;
      const onTB = (Math.abs(pt.y - bx.y0) <= tol || Math.abs(pt.y - bx.y1) <= tol) && pt.x >= bx.x0 - tol && pt.x <= bx.x1 + tol;
      if (onLR || onTB) return true;
    }
    return false;
  }
  // Parse an SVG path 'd' into points + segment axes + bend count. Understands the
  // subset the engine emits: M / H / V / L / A (arc). Arcs are corner rounding and
  // are NOT counted as diagonal segments; a bend is a change of drawn axis.
  function parsePath(d) {
    const toks = d.match(/[MLHVA][^MLHVA]*/g) || [];
    const points = [];
    const segs = [];
    let cx = 0, cy = 0, lastAxis = null, bends = 0;
    const nums = (s) => s.trim().split(/[ ,]+/).map(Number).filter((n) => !Number.isNaN(n));
    for (const tk of toks) {
      const type = tk[0];
      const n = nums(tk.slice(1));
      if (type === "M") {
        cx = n[0]; cy = n[1];
        points.push({ x: cx, y: cy, kind: "M" });
      } else if (type === "H") {
        const nx = n[0];
        if (Math.abs(nx - cx) > 0.01) {
          if (lastAxis && lastAxis !== "h") bends++;
          lastAxis = "h";
          segs.push({ axis: "h" });
        }
        cx = nx;
        points.push({ x: cx, y: cy, kind: "H" });
      } else if (type === "V") {
        const ny = n[0];
        if (Math.abs(ny - cy) > 0.01) {
          if (lastAxis && lastAxis !== "v") bends++;
          lastAxis = "v";
          segs.push({ axis: "v" });
        }
        cy = ny;
        points.push({ x: cx, y: cy, kind: "V" });
      } else if (type === "L") {
        const nx = n[0], ny = n[1];
        const dx = Math.abs(nx - cx), dy = Math.abs(ny - cy);
        let axis;
        if (dx <= 2 && dy > 2) axis = "v";
        else if (dy <= 2 && dx > 2) axis = "h";
        else if (dx <= 2 && dy <= 2) axis = lastAxis || "h"; // negligible move
        else axis = "diag"; // a real diagonal — the bug class
        if (axis !== "diag" && lastAxis && lastAxis !== axis) bends++;
        if (axis !== "diag") lastAxis = axis;
        segs.push({ axis });
        cx = nx; cy = ny;
        points.push({ x: cx, y: cy, kind: "L" });
      } else if (type === "A") {
        // arc: rx ry rot large sweep x y — a corner turn (counts as a bend, not diag)
        const nx = n[n.length - 2], ny = n[n.length - 1];
        bends++;
        cx = nx; cy = ny;
        points.push({ x: cx, y: cy, kind: "A" });
        lastAxis = null; // axis is redefined by the next drawn segment
      }
    }
    return { points, segs, bends };
  }
  // Recover a node id from a group by reading its data or falling back to text.
  function rectNodeId(g) {
    // the engine keys groups "n:<id>" but does not expose it as an attribute; use
    // the first text content as a human-recognisable fallback identifier.
    const t = g.querySelector("text");
    return "node[" + ((t && t.textContent) || "?").slice(0, 16) + "]";
  }
  return { fit, clip, overlap, height, width, grid, ortho, port, bend, row, rxc, strk };
}

/**
 * AUTHORING-PROOF (auto-layout v2): runs the REAL engine `layoutScene` over every
 * lesson's scenes (no browser needed) and asserts the "mentor can't make a crooked
 * frame" guarantees for the fully-`at` lessons:
 *   - every zone-placed node sits inside its zone with PAD≥8 on every side;
 *   - a nested node is fully contained in its parent;
 *   - all nodes of one (zone,row) share ONE center-Y (center alignment; ROW-BASELINE);
 *   - no two node boxes partially overlap (nesting containment is allowed);
 *   - grid-snap (x/y/w/h even).
 * Also prints the coverage line "autolayout: N/6 lessons fully on `at`" (closures ⇒ ≥1).
 * A lesson is "fully on at" when EVERY node in EVERY scene declares `at` (no x/y).
 */
function authoringProof() {
  const PAD = 8;
  let bad = 0;
  const fail = (m) => {
    bad++;
    log("  ✗ FAIL: AUTHORING-PROOF " + m);
  };
  const box = (n) => ({ x0: n.x - n.w / 2, y0: n.y - n.h / 2, x1: n.x + n.w / 2, y1: n.y + n.h / 2 });
  const contains = (o, i) => o.x0 <= i.x0 + 1 && o.y0 <= i.y0 + 1 && o.x1 >= i.x1 - 1 && o.y1 >= i.y1 - 1;

  let fullyOnAt = 0;
  const onAtLessons = [];
  for (const L of LESSON_DATA) {
    let lessonAllAt = true;
    let hasAtNode = false;
    for (const seg of L.segments) {
      const zones = seg.zones || [];
      const zoneById = new Map(zones.filter((z) => z.id).map((z) => [z.id, z]));
      for (const sc of seg.scenes) {
        for (const n of sc.nodes) {
          if (n.at) hasAtNode = true;
          else lessonAllAt = false;
        }
        // Only assert the layout invariants on scenes that actually use `at`
        // (un-migrated explicit-x/y scenes are covered by the browser FIT/CLIP/OVERLAP).
        if (!sc.nodes.some((n) => n.at)) continue;
        let laid;
        try {
          laid = layoutScene(sc, zones, undefined, seg.viewBox);
        } catch (e) {
          fail(`${L.id}/${seg.id}: layoutScene threw: ${e.message}`);
          continue;
        }
        const byId = new Map(laid.nodes.map((n) => [n.id, n]));
        const boxes = laid.nodes.map((n) => ({ id: n.id, ...box(n) }));
        // grid-snap
        for (const n of laid.nodes)
          for (const [k, v] of [["x", n.x], ["y", n.y], ["w", n.w], ["h", n.h]])
            if (Math.round(v) % 2 !== 0) fail(`${L.id}/${seg.id}: ${n.id}.${k}=${v} not grid-snapped`);
        // in-zone PAD≥8 + nested containment + row center-Y
        const rows = new Map();
        for (const n of sc.nodes) {
          const at = n.at;
          if (at && at.zone) {
            const z = zoneById.get(at.zone);
            if (!z) {
              fail(`${L.id}/${seg.id}: node ${n.id} references unknown zone '${at.zone}'`);
              continue;
            }
            const b = box(byId.get(n.id));
            if (b.x0 < z.x + PAD - 0.5 || b.y0 < z.y + PAD - 0.5 || b.x1 > z.x + z.w - PAD + 0.5 || b.y1 > z.y + z.h - PAD + 0.5)
              fail(`${L.id}/${seg.id}: ${n.id} not inside zone '${at.zone}' with PAD≥8`);
            const rk = at.zone + ":" + at.row;
            (rows.get(rk) || rows.set(rk, []).get(rk)).push(byId.get(n.id));
          }
          if (at && at.in) {
            const p = byId.get(at.in);
            if (!p) fail(`${L.id}/${seg.id}: nested ${n.id} references unknown parent '${at.in}'`);
            else if (!contains(box(p), box(byId.get(n.id)))) fail(`${L.id}/${seg.id}: nested ${n.id} not contained in ${at.in}`);
          }
        }
        // ROW-BASELINE: one center-Y per (zone,row)
        for (const [rk, arr] of rows) {
          const cy0 = arr[0].y;
          for (const n of arr) if (Math.abs(n.y - cy0) > 0.5) fail(`${L.id}/${seg.id}: row ${rk} center-Y mismatch on ${n.id}`);
        }
        // no partial overlap (nesting containment allowed)
        for (let i = 0; i < boxes.length; i++)
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i], b = boxes[j];
            const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
            const oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
            if (ox > 1 && oy > 1 && !contains(a, b) && !contains(b, a)) fail(`${L.id}/${seg.id}: overlap ${a.id} ∩ ${b.id}`);
          }
      }
    }
    if (lessonAllAt && hasAtNode) {
      fullyOnAt++;
      onAtLessons.push(L.id);
    }
  }
  log(`\n== AUTHORING-PROOF (auto-layout v2, pure engine) ==`);
  assert(bad === 0, `layoutScene: every at-scene is in-zone (PAD≥8), nested-contained, row-aligned, non-overlapping, snapped`);
  log(`  autolayout: ${fullyOnAt}/${LESSON_DATA.length} lessons fully on \`at\`${onAtLessons.length ? " [" + onAtLessons.join(", ") + "]" : ""}`);
  // Hard gate: EVERY lesson must be fully migrated to `at` (declarative zone/row placement).
  // If any lesson still returns hand-authored x/y coordinates, fullyOnAt drops below 6 and this
  // assert fails — catching a migration regression that `>= 1` would have silently allowed.
  assert(fullyOnAt === LESSON_DATA.length, `all ${LESSON_DATA.length}/${LESSON_DATA.length} lessons fully migrated to \`at\` (no hand-authored x/y)`);
}

async function main() {
  await preflight();
  authoringProof();
  await authApi();
  const browser = await chromium.launch();
  const consoleErrors = [];

  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await ctx.addInitScript((uid) => {
    try {
      localStorage.setItem("codex.devUserId", String(uid));
    } catch (e) {
      void e;
    }
  }, RUN_USER);
  const page = await ctx.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push(String(e)));

  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__app && window.__app.ready, { timeout: 15000 });
  await page.waitForFunction(() => window.__home && typeof window.__home.userId === "number", { timeout: 15000 });

  const allFit = [];
  const allClip = [];
  const allOverlap = [];
  const allHeight = [];
  const allWidth = [];
  const allGrid = [];
  const allOrtho = [];
  const allPort = [];
  const allBend = [];
  const allRow = [];
  const allRxc = [];
  const allStrk = [];
  // ---- transient (mid-transition) + per-scene overlap/clip totals ----
  const allTransOverlap = [];
  const allTransClip = [];
  const allSceneOverlap = [];
  let scenesChecked = 0;
  let transitionsChecked = 0;
  let midSamplesTaken = 0;

  for (const L of LESSONS) {
    log(`\n== ${L.id}: fit + clip + design-system across ${L.segs} segments ==`);
    // openLesson runs runLesson() synchronously; sample readiness with a bounded retry.
    let ready = false;
    for (let attempt = 0; attempt < 40 && !ready; attempt++) {
      await page.evaluate((id) => window.__app.openLesson(id), L.id);
      await sleep(120);
      ready = await page.evaluate(
        (id) => !!window.__viz && window.__viz.ready === true && !!window.__lesson && window.__lesson.id === id,
        L.id,
      );
    }
    assert(ready, `${L.id} opened + __viz ready`);
    const segCount = await page.evaluate(() => Object.keys(window.__viz.vizByKey).length);
    assert(segCount === L.segs, `${L.id} built ${L.segs} segments (got ${segCount})`);
    // settle every segment on its final frame (resolves predicts + runs fitLabels).
    // Wait past the FLIP/enter/exit transition (max ~620ms) so the DOM read is on the
    // fully-settled frame (not mid-animation).
    await page.evaluate(() => window.__viz.forcePlayAll());
    await sleep(1600);
    const res = await page.evaluate(measureInPage, L.id);
    for (const v of res.fit) allFit.push(v);
    for (const v of res.clip) allClip.push(v);
    for (const v of res.overlap) allOverlap.push(v);
    for (const v of res.height) allHeight.push(v);
    for (const v of res.width) allWidth.push(v);
    for (const v of res.grid) allGrid.push(v);
    for (const v of res.ortho) allOrtho.push(v);
    for (const v of res.port) allPort.push(v);
    for (const v of res.bend) allBend.push(v);
    for (const v of res.row) allRow.push(v);
    for (const v of res.rxc) allRxc.push(v);
    for (const v of res.strk) allStrk.push(v);
    assert(res.fit.length === 0, `${L.id}: every node label fits its box region (0 overflow)`);
    assert(res.clip.length === 0, `${L.id}: every node rect lies within its viewBox (0 clip)`);
    assert(res.overlap.length === 0, `${L.id}: no two node boxes overlap in any scene (0 overlap)`);
    assert(res.height.length === 0, `${L.id}: every node height ∈ {28,40,44,48,60} (HEIGHT-IN-SCALE)`);
    assert(res.width.length === 0, `${L.id}: every node width ∈ ladder {56,72,96,120,144,168} (WIDTH-ON-LADDER)`);
    assert(res.grid.length === 0, `${L.id}: every rect x/y/w/h even (GRID-SNAP)`);
    assert(res.ortho.length === 0, `${L.id}: every edge segment axis-aligned, no free diagonal (EDGE-ORTHOGONAL)`);
    assert(res.port.length === 0, `${L.id}: every edge endpoint on a node border (EDGE-PORT-ON-BORDER)`);
    assert(res.bend.length === 0, `${L.id}: every edge ≤3 bends (BEND-COUNT)`);
    assert(res.row.length === 0, `${L.id}: near-equal center-Y ⇒ identical y+height (ROW-BASELINE)`);
    assert(res.rxc.length === 0, `${L.id}: one rx per kind (RX-CONSISTENT)`);
    assert(res.strk.length === 0, `${L.id}: box kinds share stroke-width (STROKE-CONSISTENT)`);
    if (res.fit.length) for (const v of res.fit) log(`      · FIT ${v.seg}/${v.node} [${v.role}] "${v.text}" len=${v.len} > avail=${v.avail}`);
    if (res.clip.length) for (const v of res.clip) log(`      · CLIP ${v.seg}/${v.node} box=${JSON.stringify(v.box)} vb=${JSON.stringify(v.vb)}`);
    if (res.overlap.length) for (const v of res.overlap) log(`      · OVERLAP ${v.seg}: ${v.a} ∩ ${v.b} = ${JSON.stringify(v.over)}`);
    if (res.height.length) for (const v of res.height) log(`      · HEIGHT ${v.seg}/${v.node} h=${v.h}`);
    if (res.width.length) for (const v of res.width) log(`      · WIDTH ${v.seg}/${v.node} w=${v.w}`);
    if (res.grid.length) for (const v of res.grid) log(`      · GRID ${v.seg}/${v.node} ${v.coord}=${v.val}`);
    if (res.ortho.length) for (const v of res.ortho) log(`      · ORTHO ${v.seg}/${v.edge} d="${v.d}"`);
    if (res.port.length) for (const v of res.port) log(`      · PORT ${v.seg}/${v.edge} pt=${JSON.stringify(v.pt)}`);
    if (res.bend.length) for (const v of res.bend) log(`      · BEND ${v.seg}/${v.edge} bends=${v.bends}`);
    if (res.row.length) for (const v of res.row) log(`      · ROW ${v.seg}: ${v.a} vs ${v.b} (${v.reason}) ${JSON.stringify(v)}`);
    if (res.rxc.length) for (const v of res.rxc) log(`      · RX ${v.seg}/${v.node} kind=${v.kind} rx=${v.rx} exp=${v.expected}`);
    if (res.strk.length) for (const v of res.strk) log(`      · STROKE ${v.seg}/${v.node} kind=${v.kind} sw=${v.sw} exp=${v.expected}`);
  }

  // =====================================================================================
  // NEW — PER-SCENE + MID-TRANSITION overlap/clip (closes the transient-overlap hole).
  // The settled-frame pass above only ever measured each segment's FINAL scene. A crooked
  // frame can also appear (a) on an INTERMEDIATE scene, or (b) TRANSIENTLY during the
  // scene-to-scene FLIP/enter/exit transition. Here, for EVERY lesson × EVERY segment we:
  //   · goTo(i) through ALL scenes (force) and assert 0 non-nested overlap on each SETTLED
  //     scene — not just the last one;
  //   · drive the REAL animated transition i-1 → i (no per-node force delay) and SAMPLE the
  //     live geometry at ~30% / ~60% / ~90% of the move, asserting 0 non-nested overlap AND
  //     0 clip mid-flight. Nesting (a child box fully inside its parent) is exempt.
  // This is the check that would have caught the boxing s4 swap / s6 gate-over-boxes bug.
  // =====================================================================================
  const OVL_TOL = 2; // user units — crossings ≤2u are "just touching", not a visible overlap
  const MID_MS = [190, 370, 560]; // ≈30% / 60% / 90% across the staged transition window
  for (const L of LESSONS) {
    log(`\n== ${L.id}: per-scene + mid-transition overlap/clip ==`);
    let ready = false;
    for (let attempt = 0; attempt < 40 && !ready; attempt++) {
      await page.evaluate((id) => window.__app.openLesson(id), L.id);
      await sleep(120);
      ready = await page.evaluate(
        (id) => !!window.__viz && window.__viz.ready === true && !!window.__lesson && window.__lesson.id === id,
        L.id,
      );
    }
    assert(ready, `${L.id} reopened for transient probe`);
    const segKeys = await page.evaluate(() => Object.keys(window.__viz.vizByKey));
    let lessonSceneOvl = 0;
    let lessonTransOvl = 0;
    let lessonTransClip = 0;
    for (let si = 0; si < segKeys.length; si++) {
      const segKey = segKeys[si];
      const total = await page.evaluate((k) => window.__viz.vizByKey[k].total, segKey);
      // reset this segment to frame 0 (force) and settle
      await page.evaluate((k) => window.__viz.vizByKey[k].goTo(0, { force: true }), segKey);
      await sleep(650);
      // scene 0 settled check
      let r0 = await page.evaluate(([src, idx, tol]) => eval(src)(idx, tol), [PROBE_SRC, si, OVL_TOL]);
      scenesChecked++;
      for (const o of r0.overlaps) {
        lessonSceneOvl++;
        allSceneOverlap.push({ lesson: L.id, seg: segKey, scene: 0, ...o });
      }
      for (let i = 1; i < total; i++) {
        // drive the REAL transition and sample mid-flight
        await page.evaluate(([k, idx]) => window.__viz.vizByKey[k].goTo(idx, { force: true }), [segKey, i]);
        transitionsChecked++;
        let prev = 0;
        for (const t of MID_MS) {
          await sleep(t - prev);
          prev = t;
          midSamplesTaken++;
          const rm = await page.evaluate(([src, idx, tol]) => eval(src)(idx, tol), [PROBE_SRC, si, OVL_TOL]);
          for (const o of rm.overlaps) {
            lessonTransOvl++;
            allTransOverlap.push({ lesson: L.id, seg: segKey, transition: `${i - 1}→${i}`, at: `${t}ms`, ...o });
          }
          for (const c of rm.clips || []) {
            lessonTransClip++;
            allTransClip.push({ lesson: L.id, seg: segKey, transition: `${i - 1}→${i}`, at: `${t}ms`, ...c });
          }
        }
        // let the transition finish, then settled-scene check on scene i
        await sleep(360);
        const rs = await page.evaluate(([src, idx, tol]) => eval(src)(idx, tol), [PROBE_SRC, si, OVL_TOL]);
        scenesChecked++;
        for (const o of rs.overlaps) {
          lessonSceneOvl++;
          allSceneOverlap.push({ lesson: L.id, seg: segKey, scene: i, ...o });
        }
      }
    }
    assert(lessonSceneOvl === 0, `${L.id}: 0 non-nested overlap on EVERY settled scene (not just the last)`);
    assert(lessonTransOvl === 0, `${L.id}: 0 non-nested overlap MID-TRANSITION across all segments`);
    assert(lessonTransClip === 0, `${L.id}: 0 node clips the viewBox MID-TRANSITION`);
    for (const v of allSceneOverlap.filter((x) => x.lesson === L.id)) log(`      · SCENE-OVL ${v.seg}/s${v.scene}: ${v.a} ∩ ${v.b} = ${JSON.stringify(v.over)}`);
    for (const v of allTransOverlap.filter((x) => x.lesson === L.id)) log(`      · MID-OVL ${v.seg} ${v.transition} @${v.at}: ${v.a} ∩ ${v.b} = ${JSON.stringify(v.over)} (op ${v.opA}/${v.opB})`);
    for (const v of allTransClip.filter((x) => x.lesson === L.id)) log(`      · MID-CLIP ${v.seg} ${v.transition} @${v.at}: ${v.id} box=${JSON.stringify(v.box)} vb=${JSON.stringify(v.vb)}`);
  }
  log(
    `\n  probe coverage: ${scenesChecked} settled scenes + ${transitionsChecked} transitions × ${MID_MS.length} mid-samples = ${midSamplesTaken} mid-transition reads`,
  );

  // ---- Evidence screenshots of the previously-broken segments ----
  // Captured in a SEPARATE reduced-motion context: there, runLesson() draws every
  // segment's STATIC final frame at build time (no autoplay, no IntersectionObserver
  // restart) so scrolling a stage into view cannot re-trigger an animation. This yields
  // pristine settled frames — the fit-pass runs on the reduced-motion final-frame path too.
  log("\n== evidence: reduced-motion static final frames of the previously-broken segments ==");
  const rmCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
  await rmCtx.addInitScript((uid) => {
    try {
      localStorage.setItem("codex.devUserId", String(uid));
    } catch (e) {
      void e;
    }
  }, RUN_USER);
  const rmPage = await rmCtx.newPage();
  rmPage.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  rmPage.on("pageerror", (e) => consoleErrors.push(String(e)));
  await rmPage.goto(APP, { waitUntil: "networkidle" });
  await rmPage.waitForFunction(() => window.__app && window.__app.ready, { timeout: 15000 });
  let shotCount = 0;
  for (const L of LESSONS) {
    const shots = SHOTS[L.id];
    if (!shots) continue;
    let ready = false;
    for (let attempt = 0; attempt < 40 && !ready; attempt++) {
      await rmPage.evaluate((id) => window.__app.openLesson(id), L.id);
      await sleep(120);
      ready = await rmPage.evaluate(
        (id) => !!window.__viz && window.__viz.ready === true && !!window.__lesson && window.__lesson.id === id,
        L.id,
      );
    }
    if (!ready) continue;
    await sleep(200);
    const stageHandles = await rmPage.$$(".stage");
    for (const s of shots) {
      const h = stageHandles[s.seg];
      if (h) {
        await h.scrollIntoViewIfNeeded();
        await sleep(60);
        await h.screenshot({ path: `${EV}/${s.file}.png` });
        shotCount++;
      }
    }
  }
  assert(shotCount > 0, `captured ${shotCount} evidence screenshots into docs/evidence/viz-fit/`);

  log("\n== summary ==");
  assert(allFit.length === 0, `zero FIT violations across all ${LESSONS.length} lessons (found ${allFit.length})`);
  assert(allClip.length === 0, `zero CLIP violations across all ${LESSONS.length} lessons (found ${allClip.length})`);
  assert(allOverlap.length === 0, `zero OVERLAP violations across all ${LESSONS.length} lessons (found ${allOverlap.length})`);
  assert(allHeight.length === 0, `zero HEIGHT-IN-SCALE violations across all lessons (found ${allHeight.length})`);
  assert(allWidth.length === 0, `zero WIDTH-ON-LADDER violations across all lessons (found ${allWidth.length})`);
  assert(allGrid.length === 0, `zero GRID-SNAP violations across all lessons (found ${allGrid.length})`);
  assert(allOrtho.length === 0, `zero EDGE-ORTHOGONAL violations across all lessons (found ${allOrtho.length})`);
  assert(allPort.length === 0, `zero EDGE-PORT-ON-BORDER violations across all lessons (found ${allPort.length})`);
  assert(allBend.length === 0, `zero BEND-COUNT violations across all lessons (found ${allBend.length})`);
  assert(allRow.length === 0, `zero ROW-BASELINE violations across all lessons (found ${allRow.length})`);
  assert(allRxc.length === 0, `zero RX-CONSISTENT violations across all lessons (found ${allRxc.length})`);
  assert(allStrk.length === 0, `zero STROKE-CONSISTENT violations across all lessons (found ${allStrk.length})`);
  // NEW transient/per-scene totals (the closed hole).
  assert(
    allSceneOverlap.length === 0,
    `zero non-nested overlap on EVERY settled scene across all lessons (checked ${scenesChecked} scenes, found ${allSceneOverlap.length})`,
  );
  assert(
    allTransOverlap.length === 0,
    `zero non-nested overlap MID-TRANSITION across all lessons (${midSamplesTaken} mid-samples over ${transitionsChecked} transitions, found ${allTransOverlap.length})`,
  );
  assert(
    allTransClip.length === 0,
    `zero viewBox clip MID-TRANSITION across all lessons (found ${allTransClip.length})`,
  );
  assert(consoleErrors.length === 0, "zero console/page errors across the run" + (consoleErrors.length ? " -> " + JSON.stringify(consoleErrors.slice(0, 5)) : ""));

  await browser.close();
  log(`\n==== ${failed === 0 ? "ALL GREEN" : failed + " FAILED"} · runUser=${RUN_USER} ====`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
