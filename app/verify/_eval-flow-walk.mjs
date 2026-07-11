/**
 * EVALUATOR flow-walk — independent user-path check for FLOW & COMPLETENESS lens.
 * Read-only against the product: opens preview :4173 (backend :5080), walks the
 * real daily loop and records the DERIVED home state + due-count deltas + how many
 * cards a "session" actually presents. Screens captured to scratchpad.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const APP = "http://localhost:4173";
const API = "http://localhost:5080";
const OUT = "/private/tmp/claude-501/-Users-admin-Desktop-test5/0afe0c40-608b-4a2d-9bd0-9ddac2f6878c/scratchpad/flow";
const VP = { width: 390, height: 844 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function apiAuth(devUserId) {
  const res = await fetch(API + "/api/auth", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ devUserId }),
  });
  return res.json();
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const RUN_USER = 810000 + Math.floor(Math.random() * 90000);
  const auth = await apiAuth(RUN_USER);
  console.log("FRESH USER", auth.userId);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: VP, deviceScaleFactor: 2 });
  await ctx.addInitScript((uid) => {
    try { localStorage.setItem("codex.devUserId", String(uid)); } catch (e) { void e; }
  }, RUN_USER);
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  page.on("pageerror", (e) => errs.push("PAGEERR " + e.message));

  const home = async () => page.evaluate(() => (window).__home);

  // 1) FRESH boot -> first-run
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForFunction(() => (window).__home?.state, null, { timeout: 15000 });
  let h = await home();
  console.log("BOOT state=", h.state, "knownDue=", h.knownDue, "reviewsTotal=", h.reviewsTotal);
  await page.screenshot({ path: OUT + "/01-boot.png" });

  // 2) Count cards the FIRST lesson actually offers vs the hero's "N карточек" promise
  const heroPromise = await page.evaluate(() => {
    const el = document.querySelector(".hero-meta .mono, .hero-meta");
    return el ? el.textContent.trim() : null;
  });
  console.log("HERO session promise text:", heroPromise);

  // click primary CTA -> lesson
  await page.click("#heroCta");
  await page.waitForFunction(() => (window).__lesson, null, { timeout: 15000 });
  const lesson = await page.evaluate(() => (window).__lesson);
  const cardCount = await page.evaluate(() => document.querySelectorAll("#mcqCard .q-title").length);
  console.log("LESSON opened id=", lesson.id, "segments=", lesson.segments, "question-cards in DOM=", cardCount);
  await page.screenshot({ path: OUT + "/02-lesson-open.png" });

  // 3) Answer the card end-to-end, observe what "next" leads to
  await page.evaluate(() => (window).__viz?.forcePlayAll?.());
  await sleep(400);
  // answer: typed or MCQ
  const isTyped = await page.evaluate(() => !!document.querySelector("#qTyped"));
  if (isTyped) {
    const expected = await page.evaluate(() => (window).__lastAnswer?.expected
      ?? document.querySelector("#qTyped")?.getAttribute("data-x") ?? null);
    // We don't know expected before answering; just type something to trigger the flow.
    await page.fill("#qTyped", "0");
  } else {
    await page.click("#qOpts .opt");
  }
  // confidence tap if present
  const hasCalib = await page.evaluate(() => !!document.querySelector(".calib-btn"));
  if (hasCalib) await page.click(".calib-btn");
  await page.click("#qCheck");
  await sleep(500);
  await page.screenshot({ path: OUT + "/03-answered.png" });
  // grade strip
  const gradeVisible = await page.evaluate(() => {
    const g = document.querySelector("#grade");
    return g && !g.hidden;
  });
  console.log("GRADE strip visible after answer:", gradeVisible);
  await page.click('.grade-btn[data-g="3"]');
  await sleep(900);
  await page.screenshot({ path: OUT + "/04-graded.png" });
  const review = await page.evaluate(() => (window).__lastReview);
  console.log("REVIEW posted:", JSON.stringify(review));
  // what does "next" button say / lead to?
  const nextTxt = await page.evaluate(() => document.querySelector("#btnNext")?.textContent?.trim() ?? null);
  console.log("NEXT button text:", nextTxt);

  // 4) Click "next" -> back to home. Did due drop? Are we told to continue the session?
  await page.click("#btnNext");
  await page.waitForFunction(() => (window).__home?.state, null, { timeout: 15000 });
  h = await home();
  console.log("AFTER 1 CARD -> home state=", h.state, "knownDue=", h.knownDue, "todayCount=", h.todayCount);
  await page.screenshot({ path: OUT + "/05-after-one-card.png" });

  // 5) Telegram BackButton simulation: there is no in-app back; check nav presence in lesson
  await page.click("#heroCta");
  await page.waitForFunction(() => (window).__lesson, null, { timeout: 15000 });
  const lessonHasNav = await page.evaluate(() => !!document.querySelector("nav.nav"));
  const lessonHasClose = await page.evaluate(() => !!document.querySelector("#btnClose"));
  console.log("LESSON has bottom-nav?", lessonHasNav, " has close(X)?", lessonHasClose);
  // close via X -> home
  await page.click("#btnClose");
  await page.waitForFunction(() => (window).__home?.state, null, { timeout: 15000 });
  console.log("CLOSE(X) returned to home OK");

  // 6) Tab navigation round-trip
  await page.click('[data-nav="progress"]');
  await page.waitForFunction(() => (window).__progress, null, { timeout: 15000 });
  const prog = await page.evaluate(() => (window).__progress);
  console.log("PROGRESS empty?", prog.empty, "reviewsTotal=", prog.reviewsTotal);
  await page.screenshot({ path: OUT + "/06-progress.png" });
  // click a per-lesson row from progress -> should open a lesson
  const rowCount = await page.evaluate(() => document.querySelectorAll('[data-lesson]').length);
  console.log("PROGRESS clickable lesson rows:", rowCount);

  await page.click('[data-nav="profile"]');
  await page.waitForFunction(() => (window).__profile, null, { timeout: 15000 });
  console.log("PROFILE loaded");
  await page.screenshot({ path: OUT + "/07-profile.png" });
  await page.click('[data-nav="home"]');
  await page.waitForFunction(() => (window).__home?.state, null, { timeout: 15000 });
  console.log("BACK to home via nav OK");

  console.log("CONSOLE ERRORS:", errs.length, errs.slice(0, 5));
  await browser.close();
}
main().catch((e) => { console.error("WALK FAILED", e); process.exit(1); });
