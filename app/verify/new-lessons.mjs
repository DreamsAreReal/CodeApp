/**
 * Focused verification for the wave-1 lessons added in phase 4:
 *   T1.M4.gc (6 segments), T2.M2.closures (5), T2.M1.async-await (5).
 * Proves, against the LIVE backend + preview build:
 *   (a) each lesson renders its segments and the animation reaches the final
 *       frame (autoplay + StepPlayer end), (b) at least one lesson's card ->
 *       grade posts /api/review and the schedule moves (due drops), (c) zero
 *       console errors, (d) reduced-motion shows static final frames.
 * Requires: backend on :5080, `vite preview` on :4173. Writes evidence PNGs.
 */
import { chromium } from "playwright";
import { evidenceDir, preflight } from "./_util.mjs";

const APP = process.env.APP_BASE || "http://localhost:4173";
const API = process.env.VITE_API_BASE || "http://localhost:5080";
// CI-portable evidence root: $EVIDENCE_DIR on CI, else repo-relative docs/evidence (no hardcoded path).
const EV = evidenceDir();
const RUN_USER = 800000 + Math.floor(Math.random() * 90000);

const EXPECT = [
  { id: "T1.M4.gc", segs: 6, ev: "GC" },
  { id: "T2.M2.closures", segs: 5, ev: "CLOSURES" },
  { id: "T2.M1.async-await", segs: 5, ev: "ASYNC" },
  { id: "T2.M5.hashtable", segs: 6, ev: "HASHTABLE" },
  { id: "PY.M1.names-objects", segs: 8, ev: "PY-NAMES" },
  { id: "PY.M2.collections-hash", segs: 5, ev: "PY-COLL" },
  { id: "PY.M3.args-unpacking", segs: 4, ev: "PY-ARGS" },
  { id: "PY.M4.closures-scope", segs: 6, ev: "PY-CLOS" },
  { id: "PY.M5.decorators", segs: 8, ev: "PY-DECO" },
  { id: "PY.M6.generators", segs: 6, ev: "PY-GEN" },
  { id: "PY.M7.context-managers", segs: 5, ev: "PY-CM" },
  { id: "PY.M8.object-model", segs: 8, ev: "PY-OBJ" },
  { id: "PY.M9.exceptions", segs: 5, ev: "PY-EXC" },
  { id: "PY.M10.type-hints", segs: 4, ev: "PY-HINTS" },
];

const VIEWPORTS = { 375: { width: 375, height: 812 }, 768: { width: 768, height: 1024 }, 1440: { width: 1440, height: 900 }, 390: { width: 390, height: 844 } };
const log = (m) => console.log(m);
let failed = 0;
function assert(cond, msg) {
  if (cond) log("  ✓ " + msg);
  else { failed++; log("  ✗ FAIL: " + msg); }
}
// Data API requires a Bearer session token (IDOR fix): mint one for RUN_USER, send it on every call.
let apiToken = null;
async function authApi() {
  const res = await fetch(API + "/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ devUserId: RUN_USER }) });
  apiToken = (await res.json()).token;
}
const apiGet = async (p) => (await fetch(API + p, { headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {} })).json();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  await preflight();
  for (const e of EXPECT) evidenceDir(`${e.ev}`);
  const browser = await chromium.launch();
  const consoleErrors = [];

  async function newCtx(opts = {}) {
    const ctx = await browser.newContext({ viewport: VIEWPORTS[390], deviceScaleFactor: 1, ...opts });
    await ctx.addInitScript((uid) => { try { localStorage.setItem("codex.devUserId", String(uid)); } catch (e) { void e; } }, RUN_USER);
    return ctx;
  }
  function watch(page) {
    page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
    page.on("pageerror", (e) => consoleErrors.push(String(e)));
  }

  const ctx = await newCtx();
  const page = await ctx.newPage();
  watch(page);
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__app && window.__app.ready, { timeout: 15000 });
  await page.waitForFunction(() => window.__home && typeof window.__home.userId === "number", { timeout: 15000 });
  const home = await page.evaluate(() => window.__home);
  const ids = home.lessons.map((l) => l.id);
  for (const e of EXPECT) assert(ids.includes(e.id), `${e.id} present in home path`);

  // ---- each new lesson renders + animates to the final frame ----
  for (const e of EXPECT) {
    log(`\n== ${e.id}: renders ${e.segs} segments + animation plays ==`);
    // openLesson runs runLesson() synchronously (resets __viz -> rebuilds -> ready).
    // Read the settled state directly after the call resolves, with a bounded retry:
    // a polled compound predicate can miss the synchronous ready window on fast hosts,
    // so we sample state ourselves instead of racing waitForFunction.
    let ready = false;
    for (let attempt = 0; attempt < 40 && !ready; attempt++) {
      await page.evaluate((id) => window.__app.openLesson(id), e.id);
      await sleep(120);
      ready = await page.evaluate(
        (id) => !!window.__viz && window.__viz.ready === true && !!window.__lesson && window.__lesson.id === id,
        e.id,
      );
    }
    assert(ready, `${e.id} lesson opened and __viz ready`);
    const segCount = await page.evaluate(() => Object.keys(window.__viz.vizByKey).length);
    assert(segCount === e.segs, `${e.id} built ${e.segs} animated segments (got ${segCount})`);
    // segment 1 autoplays on view -> index advances beyond 0
    await page.waitForFunction(() => { const s = window.__viz.segments["s1"]; return s && s.index > 0; }, { timeout: 8000 }).catch(() => {});
    const s1i = await page.evaluate(() => window.__viz.segments["s1"].index);
    assert(s1i > 0, `${e.id} segment s1 advanced by autoplay (index=${s1i})`);
    await page.screenshot({ path: `${EV}/${e.ev}/390-autoplay.png`, fullPage: false });
    await page.evaluate(() => window.__viz.forcePlayAll());
    await sleep(400);
    const allFinal = await page.evaluate(() => Object.values(window.__viz.segments).every((s) => s.index === s.total - 1));
    assert(allFinal, `${e.id} all segments reach their final frame`);
    await page.screenshot({ path: `${EV}/${e.ev}/375-full.png`, fullPage: true });
  }

  // ---- the loop: GC card -> TYPE correct answer -> ✓ -> Good pre-selected -> /api/review ----
  log("\n== T1.M4.gc: TYPE correct answer -> ✓ -> Good pre-selected -> POST /api/review moves schedule ==");
  await page.evaluate(() => window.__app.openLesson("T1.M4.gc"));
  await page.waitForFunction(() => window.__viz && window.__viz.ready && window.__lesson.id === "T1.M4.gc", { timeout: 15000 });
  await authApi();
  const dueBefore = await apiGet(`/api/due`);
  const gcDueBefore = dueBefore.items.some((i) => i.itemId === "T1.M4.gc/c1");
  assert(gcDueBefore, "gc/c1 is due before review");
  const countBefore = dueBefore.count;
  // typed-answer card: the monospace input is present, MCQ options are NOT
  assert(await page.locator("#qTyped").count() === 1, "gc card renders typed-answer input (generation)");
  assert(await page.locator("[data-opt]").count() === 0, "gc card has no MCQ options (typed flow)");
  await page.locator("#qTyped").scrollIntoViewIfNeeded();
  await page.fill("#qTyped", "01"); // the REAL expected output (verify.expect)
  await page.click("#qCheck");
  await page.waitForSelector("#qVerdict", { state: "visible", timeout: 8000 });
  const gcAnswer = await page.evaluate(() => window.__lastAnswer);
  assert(gcAnswer.correct === true, "typing the exact expect '01' is graded objectively correct");
  assert(await page.locator('.grade-btn[data-g="3"].preselected').count() === 1, "correct -> Good (3) pre-selected");
  await page.click('.grade-btn[data-g="3"]'); // confirm the pre-selected Good
  await page.waitForFunction(() => window.__lastReview, { timeout: 8000 });
  const review = await page.evaluate(() => window.__lastReview);
  log("  review response: " + JSON.stringify(review));
  assert(review.itemId === "T1.M4.gc/c1", "review posted for gc/c1");
  assert(review.grade === "Good", "grade recorded as Good (objective correct -> Good)");
  // FSRS-6 (py-fsrs 6.3.1): a brand-new Good advances one learning step (600s == ~0.00694 d),
  // due (now + 600s) is in the future, so the card leaves the immediate due queue.
  assert(review.intervalDays > 0 && review.intervalDays < 0.02, "new Good -> learning-step interval ~600s (" + review.intervalDays + "d)");
  await page.screenshot({ path: `${EV}/GC/390-graded.png`, fullPage: false });
  const dueAfter = await apiGet(`/api/due`);
  assert(dueAfter.count === countBefore - 1, `due count dropped ${countBefore} -> ${dueAfter.count}`);
  assert(!dueAfter.items.some((i) => i.itemId === "T1.M4.gc/c1"), "gc/c1 left the due queue (schedule moved)");

  // ---- the loop (wrong path): hashtable card -> TYPE wrong -> ✗ -> Again pre-selected -> posts Again ----
  log("\n== T2.M5.hashtable: TYPE wrong answer -> ✗ -> Again pre-selected -> posts Again (same-session re-queue) ==");
  await page.evaluate(() => window.__app.openLesson("T2.M5.hashtable"));
  await page.waitForFunction(() => window.__viz && window.__viz.ready && window.__lesson.id === "T2.M5.hashtable", { timeout: 15000 });
  const htDueBefore = await apiGet(`/api/due`);
  assert(htDueBefore.items.some((i) => i.itemId === "T2.M5.hashtable/c1"), "hashtable/c1 is due before the wrong review");
  await page.locator("#qTyped").scrollIntoViewIfNeeded();
  await page.fill("#qTyped", "3"); // WRONG — the real expect is "2"
  await page.click("#qCheck");
  await page.waitForSelector("#qVerdict", { state: "visible", timeout: 8000 });
  const htAnswer = await page.evaluate(() => window.__lastAnswer);
  assert(htAnswer.correct === false, "typing a wrong output is graded objectively incorrect");
  assert(await page.locator('.grade-btn[data-g="1"].preselected').count() === 1, "wrong -> Again (1) pre-selected");
  assert(await page.locator("#qVerdict .tv-row.yours").count() === 1, "miss shows a yours-vs-expected diff");
  await page.click('.grade-btn[data-g="1"]'); // confirm the pre-selected Again
  await page.waitForFunction(() => window.__lastReview && window.__lastReview.itemId === "T2.M5.hashtable/c1", { timeout: 8000 });
  const htReview = await page.evaluate(() => window.__lastReview);
  log("  wrong review response: " + JSON.stringify(htReview));
  assert(htReview.grade === "Again", "grade recorded as Again (objective wrong -> Again)");
  // Again lands on the 1-minute learning step -> due is a short within-session step in the future.
  const htDueDeltaSec = (new Date(htReview.due).getTime() - Date.now()) / 1000;
  assert(htDueDeltaSec > 0 && htDueDeltaSec < 120, `Again re-queues hashtable/c1 due ${htDueDeltaSec.toFixed(0)}s out (< 2 min, this session)`);

  // ---- the loop (Python track): PY names-objects card -> TYPE multi-line stdout -> Good -> /api/review ----
  log("\n== PY.M1.names-objects: dis badge + TYPE the real python3.12 stdout -> ✓ -> /api/review moves schedule ==");
  await page.evaluate(() => window.__app.openLesson("PY.M1.names-objects"));
  await page.waitForFunction(() => window.__viz && window.__viz.ready && window.__lesson.id === "PY.M1.names-objects", { timeout: 15000 });
  // multitrack chrome: the bytecode panel is labelled «dis · байткод», not «IL»
  const disBadge = await page.locator(".il-badge").first().innerText();
  assert(disBadge.toLowerCase().includes("dis"), `bytecode panel badge is dis-labelled (got "${disBadge}")`);
  // python syntax highlighting is active (keyword def/for tokens marked in the code panel)
  assert((await page.locator(".code-panel .tok-ty").count()) > 0, "python keywords are highlighted in the code panel");
  // predict gate BLOCKS until resolved: s4 declares predictAt=3 — goTo(3) must refuse,
  // show the predict prompt, and succeed only after resolvePredict().
  const gate = await page.evaluate(() => {
    const v = window.__viz.vizByKey["s4"];
    v.pause();
    v.goTo(2);
    const blocked = !v.goTo(3); // the gate refuses the advance
    const el = document.querySelector('[data-seg="s4"] .vz-predict');
    const promptShown = !!el && !el.hidden;
    const idxAtGate = v.state.index;
    v.resolvePredict();
    const passed = v.goTo(3);
    return { blocked, promptShown, idxAtGate, passed, after: v.state.index };
  });
  assert(gate.blocked && gate.idxAtGate === 2, "predict gate blocks advancing past predictAt until resolved");
  assert(gate.promptShown, "blocked advance shows the predict prompt");
  assert(gate.passed && gate.after === 3, "resolving the predict unblocks the gated scene");
  const pyDueBefore = await apiGet(`/api/due`);
  assert(pyDueBefore.items.some((i) => i.itemId === "PY.M1.names-objects/c1"), "py names-objects/c1 is due before review");
  const pyCountBefore = pyDueBefore.count;
  assert(await page.locator("#qTyped").count() === 1, "py card renders typed-answer input (generation)");
  await page.locator("#qTyped").scrollIntoViewIfNeeded();
  await page.fill("#qTyped", "['a']\n['a', 'b']"); // the REAL python3.12 stdout (census-log.txt)
  await page.click("#qCheck");
  await page.waitForSelector("#qVerdict", { state: "visible", timeout: 8000 });
  const pyAnswer = await page.evaluate(() => window.__lastAnswer);
  assert(pyAnswer.correct === true, "typing the exact python3.12 stdout is graded objectively correct");
  assert(await page.locator('.grade-btn[data-g="3"].preselected').count() === 1, "correct -> Good (3) pre-selected");
  await page.click('.grade-btn[data-g="3"]');
  await page.waitForFunction(() => window.__lastReview && window.__lastReview.itemId === "PY.M1.names-objects/c1", { timeout: 8000 });
  const pyReview = await page.evaluate(() => window.__lastReview);
  log("  py review response: " + JSON.stringify(pyReview));
  assert(pyReview.grade === "Good", "py grade recorded as Good");
  await page.screenshot({ path: `${EV}/PY-NAMES/390-graded.png`, fullPage: false });
  const pyDueAfter = await apiGet(`/api/due`);
  assert(pyDueAfter.count === pyCountBefore - 1, `due count dropped ${pyCountBefore} -> ${pyDueAfter.count}`);
  assert(!pyDueAfter.items.some((i) => i.itemId === "PY.M1.names-objects/c1"), "py names-objects/c1 left the due queue (schedule moved)");

  // ---- reduced-motion static final frames for each new lesson ----
  log("\n== reduced-motion: static final frames ==");
  const rmCtx = await newCtx({ reducedMotion: "reduce", viewport: VIEWPORTS[390] });
  const rmPage = await rmCtx.newPage();
  watch(rmPage);
  await rmPage.goto(APP, { waitUntil: "networkidle" });
  await rmPage.waitForFunction(() => window.__app && window.__app.ready, { timeout: 15000 });
  for (const e of EXPECT) {
    let rmReady = false;
    for (let attempt = 0; attempt < 40 && !rmReady; attempt++) {
      await rmPage.evaluate((id) => window.__app.openLesson(id), e.id);
      await sleep(120);
      rmReady = await rmPage.evaluate(
        (id) => !!window.__viz && window.__viz.ready === true && !!window.__lesson && window.__lesson.id === id,
        e.id,
      );
    }
    assert(rmReady, `${e.id} reduced-motion: lesson opened and __viz ready`);
    const rmFinal = await rmPage.evaluate(() => Object.values(window.__viz.segments).every((s) => s.index === s.total - 1));
    assert(rmFinal, `${e.id} reduced-motion: every segment shows its final frame`);
  }
  for (const vp of [375, 768, 1440]) {
    await rmPage.setViewportSize(VIEWPORTS[vp]);
    await sleep(200);
    await rmPage.screenshot({ path: `${EV}/ASYNC/${vp}-reduced.png`, fullPage: true });
  }

  log("\n== console errors ==");
  assert(consoleErrors.length === 0, "zero console/page errors across the run" + (consoleErrors.length ? " -> " + JSON.stringify(consoleErrors.slice(0, 5)) : ""));

  await browser.close();
  log(`\n==== ${failed === 0 ? "ALL GREEN" : failed + " FAILED"} · runUser=${RUN_USER} ====`);
  process.exit(failed === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
