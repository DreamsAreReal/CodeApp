/**
 * CONSUMER walk-through capture (fresh-eyes user path), 390px phone viewport.
 * Path: home -> open boxing lesson -> let segment 1 autoplay to a final frame
 * -> answer the typed card (correct output) -> see the card feedback/verdict
 * -> Progress tab -> Profile tab. One PNG per screen into
 * docs/evidence/verify-consumer/. Requires backend :5080 + preview :4173.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { evidenceDir } from "./_util.mjs";

const APP = process.env.APP_BASE || "http://localhost:4173";
const API = process.env.VITE_API_BASE || "http://localhost:5080";
// CI-portable evidence dir (no hardcoded path): $EVIDENCE_DIR/verify-consumer on CI, else repo-relative.
const EV = evidenceDir("verify-consumer");
const RUN_USER = 610000 + Math.floor(Math.random() * 90000);
const LESSON = "T1.M3.boxing";
const VP = { width: 390, height: 844 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (m) => console.log(m);

async function apiAuth(devUserId) {
  const res = await fetch(API + "/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ devUserId }),
  });
  return res.json();
}

async function main() {
  mkdirSync(EV, { recursive: true });
  const auth = await apiAuth(RUN_USER);
  log("auth: userId=" + auth.userId + " mode=" + auth.mode);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: VP, deviceScaleFactor: 2 });
  await ctx.addInitScript((uid) => {
    try { localStorage.setItem("codex.devUserId", String(uid)); } catch (e) { void e; }
  }, RUN_USER);
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push(String(e)));

  // ---- 1) HOME (first thing a user sees) --------------------------------
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__app && window.__app.ready, { timeout: 15000 });
  await page.waitForFunction(() => window.__home && typeof window.__home.userId === "number", { timeout: 15000 });
  const home = await page.evaluate(() => window.__home);
  log("HOME: knownDue=" + home.knownDue + " lessons=" + home.lessons.length +
    " ids=" + home.lessons.map((l) => l.id).join(","));
  log("HOME lesson rows: " + JSON.stringify(home.lessons.map((l) => ({ id: l.id, due: l.due, total: l.total }))));
  await page.screenshot({ path: `${EV}/01-home.png`, fullPage: true });

  // ---- 2) OPEN LESSON + let segment 1 autoplay --------------------------
  await page.evaluate((id) => window.__app.openLesson(id), LESSON);
  await page.waitForFunction(() => window.__viz && window.__viz.ready, { timeout: 15000 });
  const segCount = await page.evaluate(() => Object.keys(window.__viz.vizByKey).length);
  log("LESSON " + LESSON + ": animated segments=" + segCount);
  // segment 1 autoplays on view -> its step index advances beyond 0
  await page.waitForFunction(() => { const s = window.__viz.segments["s1"]; return s && s.index > 0; }, { timeout: 10000 }).catch(() => {});
  const s1 = await page.evaluate(() => ({ index: window.__viz.segments["s1"].index, total: window.__viz.segments["s1"].total }));
  log("SEGMENT s1 autoplay: step " + s1.index + "/" + (s1.total - 1));
  await sleep(600);
  await page.screenshot({ path: `${EV}/02-lesson-seg1-autoplay.png`, fullPage: false });
  // full lesson view (all segments to their final frame) for the "reads as a lesson?" question
  await page.evaluate(() => window.__viz.forcePlayAll());
  await sleep(500);
  await page.screenshot({ path: `${EV}/03-lesson-full.png`, fullPage: true });

  // ---- 3) ANSWER THE CARD (typed correct output) + read the feedback ----
  const isTyped = await page.locator("#qTyped").count();
  log("CARD kind: " + (isTyped ? "typed-answer (generation)" : "MCQ (recognition)"));
  await page.locator("#qTyped").scrollIntoViewIfNeeded();
  await sleep(150);
  await page.screenshot({ path: `${EV}/04-card-prompt.png`, fullPage: false });
  await page.fill("#qTyped", "123"); // the real expected output for boxing/c1
  await page.click('[data-conf="1"]'); // calibration: "уверен?" -> yes
  await page.click("#qCheck");
  await page.waitForSelector("#qVerdict", { state: "visible", timeout: 8000 });
  const answer = await page.evaluate(() => window.__lastAnswer);
  log("ANSWER feedback: correct=" + answer.correct + " confidence=" + answer.confidence +
    " typed=" + JSON.stringify(answer.typed) + " expected=" + JSON.stringify(answer.expected));
  const preOk = await page.locator('.grade-btn[data-g="3"].preselected').count();
  log("Grade pre-selected Good(3)? " + (preOk === 1));
  await page.locator("#qVerdict").scrollIntoViewIfNeeded();
  await sleep(150);
  await page.screenshot({ path: `${EV}/05-card-feedback.png`, fullPage: false });
  // confirm the grade -> closes the FSRS loop
  await page.click('.grade-btn[data-g="3"]');
  await page.waitForFunction(() => window.__lastReview, { timeout: 8000 });
  const review = await page.evaluate(() => window.__lastReview);
  log("REVIEW posted: itemId=" + review.itemId + " grade=" + review.grade +
    " intervalDays=" + review.intervalDays + " due=" + review.due);
  await sleep(300);
  await page.screenshot({ path: `${EV}/06-card-graded.png`, fullPage: false });

  // ---- 4) PROGRESS tab (via the real bottom-nav, like a user) -----------
  await page.evaluate(() => window.__app.showHome());
  await page.waitForFunction(() => window.__home && typeof window.__home.userId === "number", { timeout: 8000 });
  await page.locator('[data-nav="progress"]').click();
  await page.waitForFunction(() => window.__progress, { timeout: 8000 });
  const prog = await page.evaluate(() => window.__progress);
  log("PROGRESS state: " + JSON.stringify(prog));
  await sleep(300);
  await page.screenshot({ path: `${EV}/07-progress.png`, fullPage: true });

  // ---- 5) PROFILE tab ---------------------------------------------------
  await page.locator('[data-nav="profile"]').click();
  await page.waitForFunction(() => window.__profile, { timeout: 8000 });
  const prof = await page.evaluate(() => window.__profile);
  log("PROFILE state: " + JSON.stringify(prof));
  await sleep(300);
  await page.screenshot({ path: `${EV}/08-profile.png`, fullPage: true });

  log("\nconsole/page errors: " + consoleErrors.length + (consoleErrors.length ? " -> " + JSON.stringify(consoleErrors.slice(0, 5)) : ""));
  await browser.close();
  log("DONE runUser=" + RUN_USER + " -> " + EV);
}
main().catch((e) => { console.error(e); process.exit(1); });
