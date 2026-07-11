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
import { mkdirSync } from "node:fs";

const APP = process.env.APP_BASE || "http://localhost:4173";
const API = process.env.VITE_API_BASE || "http://localhost:5080";
const EV = "/Users/admin/Desktop/test5/docs/evidence";
const RUN_USER = 800000 + Math.floor(Math.random() * 90000);

const EXPECT = [
  { id: "T1.M4.gc", segs: 6, ev: "GC" },
  { id: "T2.M2.closures", segs: 5, ev: "CLOSURES" },
  { id: "T2.M1.async-await", segs: 5, ev: "ASYNC" },
  { id: "T2.M5.hashtable", segs: 6, ev: "HASHTABLE" },
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
  for (const e of EXPECT) mkdirSync(`${EV}/${e.ev}`, { recursive: true });
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

  // ---- the loop: GC card -> grade Good -> /api/review moves schedule ----
  log("\n== T1.M4.gc: answer card -> grade Good -> POST /api/review moves schedule ==");
  await page.evaluate(() => window.__app.openLesson("T1.M4.gc"));
  await page.waitForFunction(() => window.__viz && window.__viz.ready && window.__lesson.id === "T1.M4.gc", { timeout: 15000 });
  await authApi();
  const dueBefore = await apiGet(`/api/due`);
  const gcDueBefore = dueBefore.items.some((i) => i.itemId === "T1.M4.gc/c1");
  assert(gcDueBefore, "gc/c1 is due before review");
  const countBefore = dueBefore.count;
  await page.locator('[data-opt="0"]').scrollIntoViewIfNeeded();
  await page.click('[data-opt="0"]'); // correct answer "01"
  await page.click("#qCheck");
  await page.waitForSelector('.grade-btn[data-g="3"]', { state: "visible", timeout: 8000 });
  await page.click('.grade-btn[data-g="3"]');
  await page.waitForFunction(() => window.__lastReview, { timeout: 8000 });
  const review = await page.evaluate(() => window.__lastReview);
  log("  review response: " + JSON.stringify(review));
  assert(review.itemId === "T1.M4.gc/c1", "review posted for gc/c1");
  assert(review.grade === "Good", "grade recorded as Good");
  // FSRS-6 (py-fsrs 6.3.1): a brand-new Good advances one learning step (600s == ~0.00694 d),
  // due (now + 600s) is in the future, so the card leaves the immediate due queue.
  assert(review.intervalDays > 0 && review.intervalDays < 0.02, "new Good -> learning-step interval ~600s (" + review.intervalDays + "d)");
  await page.screenshot({ path: `${EV}/GC/390-graded.png`, fullPage: false });
  const dueAfter = await apiGet(`/api/due`);
  assert(dueAfter.count === countBefore - 1, `due count dropped ${countBefore} -> ${dueAfter.count}`);
  assert(!dueAfter.items.some((i) => i.itemId === "T1.M4.gc/c1"), "gc/c1 left the due queue (schedule moved)");

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
