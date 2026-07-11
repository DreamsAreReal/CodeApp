/**
 * Headless verification harness (Playwright/Chromium).
 * Proves the walking skeleton end-to-end against the LIVE backend:
 *   F1 home loads + dev-auth + live due   F2 lesson renders + animation plays
 *   F3 card -> grade -> /api/review moves the schedule (due drops)
 *   F4 second lesson renders + plays       F5 reduced-motion + responsive
 * Requires: backend on :5080, `vite preview` on :4173. Writes evidence PNGs.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const APP = process.env.APP_BASE || "http://localhost:4173";
const API = process.env.VITE_API_BASE || "http://localhost:5080";
const EV = "/Users/admin/Desktop/test5/docs/evidence";
const RUN_USER = 900000 + Math.floor(Math.random() * 90000);

const VIEWPORTS = {
  375: { width: 375, height: 812 },
  768: { width: 768, height: 1024 },
  1440: { width: 1440, height: 900 },
  390: { width: 390, height: 844 },
};

const log = (m) => console.log(m);
let failed = 0;
function assert(cond, msg) {
  if (cond) log("  ✓ " + msg);
  else {
    failed++;
    log("  ✗ FAIL: " + msg);
  }
}
// The data API now requires a Bearer session token (IDOR fix): POST /api/auth {devUserId}
// once to mint a token, then send it on every direct API call. userId is server-derived.
let apiToken = null;
async function apiAuth(devUserId) {
  const res = await fetch(API + "/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ devUserId }),
  });
  const j = await res.json();
  apiToken = j.token;
  return j;
}
const apiGet = async (p) =>
  (await fetch(API + p, { headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {} })).json();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  for (const f of ["F1", "F2", "F3", "F4", "F5", "F6"]) mkdirSync(`${EV}/${f}`, { recursive: true });
  // Mint a session token for RUN_USER so the harness's direct API calls (Bearer) read the
  // SAME user the browser dev-auths as (both keyed on RUN_USER).
  await apiAuth(RUN_USER);
  const browser = await chromium.launch();
  const consoleErrors = [];

  async function newCtx(opts = {}) {
    const ctx = await browser.newContext({ viewport: VIEWPORTS[390], deviceScaleFactor: 1, ...opts });
    await ctx.addInitScript((uid) => {
      try {
        localStorage.setItem("codex.devUserId", String(uid));
      } catch (e) {
        void e;
      }
    }, RUN_USER);
    return ctx;
  }
  function watch(page) {
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(m.text());
    });
    page.on("pageerror", (e) => consoleErrors.push(String(e)));
  }

  // ===================== F1 — home + dev-auth + live due =====================
  log("\n== F1: home loads, dev-auth, live due ==");
  const ctx = await newCtx();
  const page = await ctx.newPage();
  watch(page);
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__app && window.__app.ready, { timeout: 15000 });
  await page.waitForFunction(() => window.__home && typeof window.__home.userId === "number", { timeout: 15000 });
  const home = await page.evaluate(() => window.__home);
  log("  home state: " + JSON.stringify(home));
  assert(home.mode === "dev", "authenticated in dev mode");
  assert(home.userId === RUN_USER, "userId matches stable devUserId " + RUN_USER);
  assert(home.knownDue > 0, "live due queue is non-empty (knownDue=" + home.knownDue + ")");
  const ids = home.lessons.map((l) => l.id);
  assert(ids.includes("T1.M3.boxing"), "boxing present in path");
  assert(ids.includes("T1.M2.value-vs-reference"), "value-vs-reference present in path");
  const boxingRow = home.lessons.find((l) => l.id === "T1.M3.boxing");
  assert(boxingRow.due === boxingRow.total && boxingRow.total > 0, "boxing shows real due=total for a fresh user");
  for (const vp of [375, 768, 1440]) {
    await page.setViewportSize(VIEWPORTS[vp]);
    await sleep(250);
    await page.screenshot({ path: `${EV}/F1/${vp}-home.png`, fullPage: true });
  }

  // ===================== F2 — lesson renders + animation plays ================
  log("\n== F2: boxing renders 7 segments, animation plays ==");
  await page.setViewportSize(VIEWPORTS[390]);
  await page.evaluate(() => window.__app.openLesson("T1.M3.boxing"));
  await page.waitForFunction(() => window.__viz && window.__viz.ready, { timeout: 15000 });
  const segCount = await page.evaluate(() => Object.keys(window.__viz.vizByKey).length);
  assert(segCount === 7, "boxing built 7 animated segments (got " + segCount + ")");
  // segment 1 autoplays on view -> its step index advances beyond 0
  await page.waitForFunction(
    () => {
      const s = window.__viz.segments["s1"];
      return s && s.index > 0;
    },
    { timeout: 8000 },
  );
  const s1Index = await page.evaluate(() => window.__viz.segments["s1"].index);
  assert(s1Index > 0, "segment s1 animation advanced by autoplay (index=" + s1Index + ")");
  await page.screenshot({ path: `${EV}/F2/390-boxing-autoplay.png`, fullPage: false });
  // force every segment to its final frame and verify the engine reached the end
  await page.evaluate(() => window.__viz.forcePlayAll());
  await sleep(400);
  const allFinal = await page.evaluate(() =>
    Object.values(window.__viz.segments).every((s) => s.index === s.total - 1),
  );
  assert(allFinal, "all 7 segments reach their final frame (data-join/StepPlayer end)");
  await page.screenshot({ path: `${EV}/F2/375-boxing-full.png`, fullPage: true });

  // ===================== F3 — the loop: TYPED answer -> objective grade -> review =====
  // The card is now typed generation: TYPE the correct output "123" -> objective ✓ -> Good is
  // PRE-SELECTED -> confirm -> POST /api/review posts Good -> the schedule moves (card leaves due).
  log("\n== F3: TYPE correct answer -> ✓ -> Good pre-selected -> POST /api/review moves schedule ==");
  const dueBefore = await apiGet(`/api/due`);
  const countBefore = dueBefore.count;
  const boxingC1Before = dueBefore.items.some((i) => i.itemId === "T1.M3.boxing/c1");
  assert(boxingC1Before, "boxing/c1 is due before review");
  // it is a typed-answer card: the monospace input is present, the MCQ options are NOT
  assert(await page.locator("#qTyped").count() === 1, "typed-answer input rendered (generation, not MCQ)");
  assert(await page.locator("[data-opt]").count() === 0, "no MCQ options on a typed-answer card");
  await page.locator("#qTyped").scrollIntoViewIfNeeded();
  await page.fill("#qTyped", "123"); // the REAL expected output (verify.expect)
  await page.click('[data-conf="1"]'); // calibration: "уверен?" -> да
  await page.click("#qCheck");
  // objective verdict is primary + the correct grade is pre-selected
  await page.waitForSelector("#qVerdict", { state: "visible", timeout: 8000 });
  const answer = await page.evaluate(() => window.__lastAnswer);
  log("  __lastAnswer: " + JSON.stringify(answer));
  assert(answer.correct === true, "typing the exact expect is graded objectively correct");
  assert(answer.confidence === true, "confidence tap captured (уверен = true)");
  assert(await page.locator('.grade-btn[data-g="3"].preselected').count() === 1, "correct -> Good (3) pre-selected");
  await page.click('.grade-btn[data-g="3"]'); // confirm the pre-selected Good
  await page.waitForFunction(() => window.__lastReview, { timeout: 8000 });
  const review = await page.evaluate(() => window.__lastReview);
  log("  review response: " + JSON.stringify(review));
  assert(review.itemId === "T1.M3.boxing/c1", "review posted for boxing/c1");
  assert(review.grade === "Good", "grade recorded as Good (objective correct -> Good)");
  // FSRS-6 (py-fsrs 6.3.1): a brand-new Good advances one learning step (600s == ~0.00694 d).
  // Its due (now + 600s) is in the future, so the card leaves the immediate due queue.
  assert(review.intervalDays > 0 && review.intervalDays < 0.02, "new Good -> learning-step interval ~600s (" + review.intervalDays + "d)");
  await page.screenshot({ path: `${EV}/F3/390-graded.png`, fullPage: false });
  const dueAfter = await apiGet(`/api/due`);
  assert(dueAfter.count === countBefore - 1, `due count dropped ${countBefore} -> ${dueAfter.count}`);
  assert(!dueAfter.items.some((i) => i.itemId === "T1.M3.boxing/c1"), "boxing/c1 left the due queue (schedule moved)");
  // returning home reflects the new server state
  await page.evaluate(() => window.__app.showHome());
  await page.waitForFunction((c) => window.__home && window.__home.knownDue === c, { timeout: 8000 }, home.knownDue - 1).catch(() => {});
  const home2 = await page.evaluate(() => window.__home);
  assert(home2.knownDue === home.knownDue - 1, `home due updated ${home.knownDue} -> ${home2.knownDue} after review`);
  const stats2 = await apiGet(`/api/stats`);
  assert(stats2.reviewsTotal === 1 && stats2.xp === 10, "server stats reflect the review (reviewsTotal=1, xp=10)");

  // ===================== F4 — second lesson renders + plays ===================
  log("\n== F4: value-vs-reference renders 4 segments, plays ==");
  await page.evaluate(() => window.__app.openLesson("T1.M2.value-vs-reference"));
  await page.waitForFunction(() => window.__viz && window.__viz.ready && window.__lesson.id === "T1.M2.value-vs-reference", { timeout: 15000 });
  const segCount2 = await page.evaluate(() => Object.keys(window.__viz.vizByKey).length);
  assert(segCount2 === 4, "value-vs-reference built 4 animated segments (got " + segCount2 + ")");
  await page.evaluate(() => window.__viz.forcePlayAll());
  await sleep(300);
  const allFinal2 = await page.evaluate(() => Object.values(window.__viz.segments).every((s) => s.index === s.total - 1));
  assert(allFinal2, "all value-vs-reference segments reach final frame");
  await page.screenshot({ path: `${EV}/F4/375-valref-full.png`, fullPage: true });
  await page.setViewportSize(VIEWPORTS[390]);
  await page.evaluate(() => window.__viz.vizByKey["s2"].showFinal());
  await sleep(200);
  await page.screenshot({ path: `${EV}/F4/390-valref-seg.png`, fullPage: false });

  // ===================== F5 — reduced-motion + responsive =====================
  log("\n== F5: reduced-motion static frames + responsive ==");
  const rmCtx = await newCtx({ reducedMotion: "reduce", viewport: VIEWPORTS[390] });
  const rmPage = await rmCtx.newPage();
  watch(rmPage);
  await rmPage.goto(APP, { waitUntil: "networkidle" });
  await rmPage.waitForFunction(() => window.__app && window.__app.ready, { timeout: 15000 });
  await rmPage.evaluate(() => window.__app.openLesson("T1.M3.boxing"));
  await rmPage.waitForFunction(() => window.__viz && window.__viz.ready, { timeout: 15000 });
  await sleep(400);
  const rmFinal = await rmPage.evaluate(() => Object.values(window.__viz.segments).every((s) => s.index === s.total - 1));
  assert(rmFinal, "reduced-motion: every segment shows its final frame (no autoplay needed)");
  await rmPage.screenshot({ path: `${EV}/F5/390-reduced-boxing.png`, fullPage: false });
  for (const vp of [375, 768, 1440]) {
    await rmPage.setViewportSize(VIEWPORTS[vp]);
    await sleep(200);
    await rmPage.screenshot({ path: `${EV}/F5/${vp}-lesson.png`, fullPage: true });
  }

  // ===================== F6 — WRONG typed answer re-queues the card (FSRS same-session) =====
  // Type a WRONG output -> objective ✗ -> Again PRE-SELECTED -> POST /api/review posts Again ->
  // FSRS-6 relearning keeps the card DUE this session (its itemId is back in /api/due).
  log("\n== F6: TYPE wrong answer -> ✗ -> Again pre-selected -> posts Again -> card due again this session ==");
  await page.setViewportSize(VIEWPORTS[390]);
  await page.evaluate(() => window.__app.openLesson("T1.M2.value-vs-reference"));
  await page.waitForFunction(() => window.__viz && window.__viz.ready && window.__lesson.id === "T1.M2.value-vs-reference", { timeout: 15000 });
  const dueBeforeWrong = await apiGet(`/api/due`);
  assert(dueBeforeWrong.items.some((i) => i.itemId === "T1.M2.value-vs-reference/c1"), "value-vs-reference/c1 is due before the wrong review");
  await page.locator("#qTyped").scrollIntoViewIfNeeded();
  await page.fill("#qTyped", "9"); // WRONG — the real expect is "1"
  await page.click('[data-conf="1"]'); // said "уверен" but is wrong -> overconfident (the valuable signal)
  await page.click("#qCheck");
  await page.waitForSelector("#qVerdict", { state: "visible", timeout: 8000 });
  const wrongAnswer = await page.evaluate(() => window.__lastAnswer);
  log("  __lastAnswer(wrong): " + JSON.stringify(wrongAnswer));
  assert(wrongAnswer.correct === false, "a wrong typed answer is graded objectively incorrect");
  assert(await page.locator('.grade-btn[data-g="1"].preselected').count() === 1, "wrong -> Again (1) pre-selected");
  // the yours-vs-expected diff is shown on a miss
  assert(await page.locator("#qVerdict .tv-row.yours").count() === 1, "miss shows a yours-vs-expected diff");
  await page.screenshot({ path: `${EV}/F6/390-wrong-typed.png`, fullPage: false });
  await page.click('.grade-btn[data-g="1"]'); // confirm the pre-selected Again
  await page.waitForFunction(() => window.__lastReview && window.__lastReview.itemId === "T1.M2.value-vs-reference/c1", { timeout: 8000 });
  const wrongReview = await page.evaluate(() => window.__lastReview);
  log("  wrong review response: " + JSON.stringify(wrongReview));
  assert(wrongReview.grade === "Again", "grade recorded as Again (objective wrong -> Again)");
  // FSRS-6 (py-fsrs 6.3.1): a brand-new Again lands on learning step 0 = 1 MINUTE, so the card's
  // due is a short within-session step in the near future (NOT days out like a Good). This is the
  // same-session relearning re-queue: the mistake resurfaces this session, not tomorrow.
  assert(wrongReview.intervalDays < 0.02, "Again -> short within-session step (" + wrongReview.intervalDays + "d ~= 60s)");
  const dueDeltaSec = (new Date(wrongReview.due).getTime() - Date.now()) / 1000;
  assert(dueDeltaSec > 0 && dueDeltaSec < 120, `Again re-queues due ${dueDeltaSec.toFixed(0)}s out (< 2 min, this session)`);
  // Prove the re-queue for real: poll /api/due until the 1-minute learning step elapses and the
  // card RE-APPEARS as due this session (ties the objective wrong answer to FSRS relearning).
  let requeued = false;
  for (let waited = 0; waited < 80 && !requeued; waited += 3) {
    const d = await apiGet(`/api/due`);
    requeued = d.items.some((i) => i.itemId === "T1.M2.value-vs-reference/c1");
    if (!requeued) await sleep(3000);
  }
  assert(requeued, "value-vs-reference/c1 RE-APPEARS in /api/due after its learning step (same-session relearning re-queue)");

  // ===================== console errors gate (G5) ============================
  log("\n== G5: console errors ==");
  assert(consoleErrors.length === 0, "zero console/page errors across the run" + (consoleErrors.length ? " -> " + JSON.stringify(consoleErrors.slice(0, 5)) : ""));

  await browser.close();
  log(`\n==== ${failed === 0 ? "ALL GREEN" : failed + " FAILED"} · runUser=${RUN_USER} ====`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
