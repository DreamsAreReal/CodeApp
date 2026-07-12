/**
 * Evidence screenshots for the P2-final wave (390px). Against preview :4173 + the live backend:
 *   - progress : the per-lesson list with a MIX of started + not-started topics, proving the new
 *                hierarchy — started rows keep the coral ring, unstarted (0%) rows show their
 *                line-icon in a muted sage tile (no more stack of identical empty gray rings).
 *   - done     : "День закрыт" hero showing the FSRS forward-hook line (.done-fsrs) that points
 *                to how the schedule works, reachable even if onboarding was skipped.
 *   - profile  : the about card whose coral .pf-mark spark now renders from currentColor (token),
 *                looking the same as before (white spark on the coral gradient).
 *
 * Writes to docs/evidence/p2-final/390-*.png for human review.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const APP = process.env.APP_BASE || "http://localhost:4173";
const EV = "/Users/admin/Desktop/test5/docs/evidence/p2-final";
const VP = { width: 390, height: 844 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FRESH = () => 640000 + Math.floor(Math.random() * 90000);
const log = (m) => console.log(m);

async function main() {
  mkdirSync(EV, { recursive: true });
  const browser = await chromium.launch();

  async function ctxFor(uid) {
    const ctx = await browser.newContext({ viewport: VP, deviceScaleFactor: 2 });
    await ctx.addInitScript((id) => {
      try {
        localStorage.setItem("codex.devUserId", String(id));
        localStorage.setItem("codex.onboarded", "1");
      } catch (e) {
        void e;
      }
    }, uid);
    return ctx;
  }

  async function answerAndGrade(page) {
    await page.waitForFunction(() => window.__lesson, { timeout: 15000 });
    if (await page.locator("#qTyped").count()) {
      await page.locator("#qTyped").fill("42");
      await page.click("#qCheck");
    } else {
      await page.locator(".opt").first().click();
      await page.click("#qCheck");
    }
    await page.waitForSelector('.grade-btn[data-g="3"]', { timeout: 8000 });
    await page.click('.grade-btn[data-g="3"]');
    await page.waitForSelector("#btnNext", { timeout: 8000 });
  }

  const uid = FRESH();
  const ctx = await ctxFor(uid);
  const page = await ctx.newPage();
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__home && window.__home.state, { timeout: 15000 });

  // Start exactly ONE lesson and grade its card so it becomes "started" (segments viewed + a review),
  // leaving the other five lessons untouched (0% viewing) -> the progress list shows BOTH kinds.
  log("seed: open + grade one lesson (leaves others not-started)");
  await page.evaluate(() => window.__app.openLesson("T1.M2.value-vs-reference"));
  await answerAndGrade(page);
  await page.click("#btnNext");
  await page.waitForFunction(() => window.__home && window.__home.state, { timeout: 15000 });
  await sleep(300);

  // ---- progress (mixed started / not-started) ----
  log("progress");
  await page.locator('[data-nav="progress"]').click();
  await page.waitForFunction(() => window.__progress && window.__progress.empty === false, { timeout: 15000 });
  await sleep(500);
  const rows = await page.evaluate(() => {
    const started = document.querySelectorAll(".lesson-list .topic:not(.not-started)").length;
    const notStarted = document.querySelectorAll(".lesson-list .topic.not-started").length;
    const icons = document.querySelectorAll(".lesson-list .topic.not-started .t-ic svg").length;
    return { started, notStarted, icons };
  });
  log(`  progress rows: started=${rows.started} not-started=${rows.notStarted} icon-tiles=${rows.icons}`);
  if (rows.notStarted < 1 || rows.started < 1) throw new Error("progress list did not show BOTH started and not-started rows");
  if (rows.icons !== rows.notStarted) throw new Error("not every not-started row rendered a line-icon tile");
  // scroll the per-lesson list into view for the shot
  await page.evaluate(() => document.querySelector(".lesson-list")?.scrollIntoView({ block: "center" }));
  await sleep(300);
  await page.screenshot({ path: `${EV}/390-progress.png`, fullPage: true });
  const listEl = page.locator(".lesson-list");
  await listEl.scrollIntoViewIfNeeded();
  await sleep(200);
  await listEl.screenshot({ path: `${EV}/390-progress-list-clip.png` });

  // ---- done (FSRS forward-hook visible) ----
  log("done (forced hero -> FSRS forward-hook line)");
  await page.locator('[data-nav="home"]').click();
  await page.waitForFunction(() => window.__home && window.__home.state, { timeout: 15000 });
  await sleep(300);
  await page.evaluate(() => window.__forceHomeHero("done"));
  await page.waitForSelector(".hero-done .done-fsrs span", { timeout: 8000 });
  await sleep(300);
  const fsrs = await page.evaluate(() => document.querySelector(".done-fsrs span")?.textContent?.trim());
  log(`  done: .done-fsrs = ${JSON.stringify(fsrs)}`);
  if (!fsrs || !fsrs.includes("забудешь")) throw new Error("FSRS forward-hook line missing from done hero");
  await page.screenshot({ path: `${EV}/390-done.png`, fullPage: true });

  // ---- profile (spark renders from currentColor token) ----
  log("profile");
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__home && window.__home.state, { timeout: 15000 });
  await page.locator('[data-nav="profile"]').click();
  await page.waitForFunction(() => window.__profile && window.__profile.sections, { timeout: 15000 });
  await sleep(400);
  const spark = await page.evaluate(() => {
    const svg = document.querySelector(".pf-mark svg");
    if (!svg) return { present: false };
    const paths = [...svg.querySelectorAll("path")];
    const rawHex = paths.some((p) => (p.getAttribute("fill") || "").startsWith("#"));
    const cs = getComputedStyle(svg).color;
    return { present: true, rawHex, color: cs, fills: paths.map((p) => p.getAttribute("fill")) };
  });
  log(`  profile spark: ${JSON.stringify(spark)}`);
  if (!spark.present) throw new Error("spark svg missing on about card");
  if (spark.rawHex) throw new Error("spark still has a raw hex fill attribute");
  await page.evaluate(() => document.querySelector(".pf-about")?.scrollIntoView({ block: "center" }));
  await sleep(300);
  await page.screenshot({ path: `${EV}/390-profile.png`, fullPage: true });
  const markEl = page.locator(".pf-mark");
  await sleep(150);
  await markEl.screenshot({ path: `${EV}/390-profile-spark-clip.png` });

  await browser.close();
  log("\n==== P2-FINAL SHOTS DONE -> " + EV + " ====");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
