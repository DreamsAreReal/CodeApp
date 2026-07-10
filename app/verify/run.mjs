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
  for (const f of ["F1", "F2", "F3", "F4", "F5"]) mkdirSync(`${EV}/${f}`, { recursive: true });
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

  // ===================== F3 — the loop: card -> grade -> review ===============
  log("\n== F3: answer card -> grade Good -> POST /api/review moves schedule ==");
  const dueBefore = await apiGet(`/api/due`);
  const countBefore = dueBefore.count;
  const boxingC1Before = dueBefore.items.some((i) => i.itemId === "T1.M3.boxing/c1");
  assert(boxingC1Before, "boxing/c1 is due before review");
  await page.locator('[data-opt="0"]').scrollIntoViewIfNeeded();
  await page.click('[data-opt="0"]'); // correct answer "123"
  await page.click("#qCheck");
  await page.waitForSelector('.grade-btn[data-g="3"]', { state: "visible", timeout: 8000 });
  await page.click('.grade-btn[data-g="3"]'); // Good
  await page.waitForFunction(() => window.__lastReview, { timeout: 8000 });
  const review = await page.evaluate(() => window.__lastReview);
  log("  review response: " + JSON.stringify(review));
  assert(review.itemId === "T1.M3.boxing/c1", "review posted for boxing/c1");
  assert(review.grade === "Good", "grade recorded as Good");
  assert(review.intervalDays >= 3 && review.intervalDays <= 3.5, "new Good -> ~3.26d interval (" + review.intervalDays + ")");
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
