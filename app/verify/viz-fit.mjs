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
import { mkdirSync } from "node:fs";

const APP = process.env.APP_BASE || "http://localhost:4173";
const API = process.env.VITE_API_BASE || "http://localhost:5080";
const EV = "/Users/admin/Desktop/test5/docs/evidence/viz-fit";
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
  const FIT_TOL = 1;
  const CLIP_TOL = 0.75;
  const OVL_TOL = 1; // px: ignore ≤1px touching edges (adjacent boxes may share a border)
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
  });
  function round(n) {
    return Math.round(n * 100) / 100;
  }
  // Recover a node id from a group by reading its data or falling back to text.
  function rectNodeId(g) {
    // the engine keys groups "n:<id>" but does not expose it as an attribute; use
    // the first text content as a human-recognisable fallback identifier.
    const t = g.querySelector("text");
    return "node[" + ((t && t.textContent) || "?").slice(0, 16) + "]";
  }
  return { fit, clip, overlap };
}

async function main() {
  mkdirSync(EV, { recursive: true });
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

  for (const L of LESSONS) {
    log(`\n== ${L.id}: fit + clip across ${L.segs} segments ==`);
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
    assert(res.fit.length === 0, `${L.id}: every node label fits its box region (0 overflow)`);
    assert(res.clip.length === 0, `${L.id}: every node rect lies within its viewBox (0 clip)`);
    assert(res.overlap.length === 0, `${L.id}: no two node boxes overlap in any scene (0 overlap)`);
    if (res.fit.length) for (const v of res.fit) log(`      · FIT ${v.seg}/${v.node} [${v.role}] "${v.text}" len=${v.len} > avail=${v.avail}`);
    if (res.clip.length) for (const v of res.clip) log(`      · CLIP ${v.seg}/${v.node} box=${JSON.stringify(v.box)} vb=${JSON.stringify(v.vb)}`);
    if (res.overlap.length) for (const v of res.overlap) log(`      · OVERLAP ${v.seg}: ${v.a} ∩ ${v.b} = ${JSON.stringify(v.over)}`);
  }

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
  assert(consoleErrors.length === 0, "zero console/page errors across the run" + (consoleErrors.length ? " -> " + JSON.stringify(consoleErrors.slice(0, 5)) : ""));

  await browser.close();
  log(`\n==== ${failed === 0 ? "ALL GREEN" : failed + " FAILED"} · runUser=${RUN_USER} ====`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
