/**
 * F14 evidence: the Progress screen with BOTH tracks' data must keep PY lessons
 * visually separate from C# (per-lesson list grouped by track group, no new
 * screens). Flow: fresh user -> answer + grade one C# card (T1.M4.gc/c1) and
 * one PY card (PY.M13.stdlib-idioms/c1) -> open Progress -> assert grouped
 * headers + per-group counts -> screenshots to evidence/F14.
 */
import { chromium } from "playwright";

const APP = process.env.APP_BASE || "http://localhost:4173";
const EV = "/Users/admin/Desktop/CodeApp/docs/tasks/python-track/evidence/F14";
const RUN_USER = 950000 + Math.floor(Math.random() * 9000);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = 0;
const assert = (c, m) => { if (c) console.log("  ✓ " + m); else { failed++; console.log("  ✗ FAIL: " + m); } };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.addInitScript((uid) => { try { localStorage.setItem("codex.devUserId", String(uid)); } catch (e) { void e; } }, RUN_USER);
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(APP, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__app && window.__app.ready, { timeout: 15000 });
await page.waitForFunction(() => window.__home && typeof window.__home.userId === "number", { timeout: 15000 });

// one graded card per track: C# then PY (both typed exec cards, correct answers)
const takes = [
  { lesson: "T1.M4.gc", card: "T1.M4.gc/c1", answer: "01" },
  { lesson: "PY.M13.stdlib-idioms", card: "PY.M13.stdlib-idioms/c1", answer: ".json\nusers" },
];
for (const t of takes) {
  await page.evaluate((id) => window.__app.openLesson(id), t.lesson);
  await page.waitForFunction((id) => window.__viz && window.__viz.ready && window.__lesson.id === id, t.lesson, { timeout: 15000 });
  await page.locator("#qTyped").scrollIntoViewIfNeeded();
  await page.fill("#qTyped", t.answer);
  await page.click("#qCheck");
  await page.waitForSelector("#qVerdict", { state: "visible", timeout: 8000 });
  const ans = await page.evaluate(() => window.__lastAnswer);
  assert(ans.correct === true, `${t.card}: typed answer graded correct`);
  await page.click('.grade-btn[data-g="3"]');
  await page.waitForFunction((c) => window.__lastReview && window.__lastReview.itemId === c, t.card, { timeout: 8000 });
  const rev = await page.evaluate(() => window.__lastReview);
  assert(rev.grade === "Good", `${t.card}: /api/review recorded Good`);
}

// Progress screen: both tracks' data present, per-lesson list grouped by track
await page.evaluate(() => window.__app.showHome());
await page.waitForSelector('nav.nav [data-nav="progress"]', { timeout: 15000 });
await page.click('nav.nav [data-nav="progress"]');
await page.waitForFunction(() => window.__progress && window.__progress.empty === false, { timeout: 15000 });
const pg = await page.evaluate(() => window.__progress);
console.log("  __progress.perLessonGroups: " + JSON.stringify(pg.perLessonGroups));
assert(pg.reviewsTotal >= 2, `reviews from both tracks counted (reviewsTotal=${pg.reviewsTotal})`);
const gCs = (pg.perLessonGroups || []).find((g) => g.id === "csharp");
const gPy = (pg.perLessonGroups || []).find((g) => g.id === "python");
assert(gCs && gCs.count > 0, `csharp group has per-lesson rows (${gCs && gCs.count})`);
assert(gPy && gPy.count > 0, `python group has per-lesson rows (${gPy && gPy.count})`);
assert(gCs.count + gPy.count === pg.perLesson, `groups cover all perLesson rows (${gCs.count}+${gPy.count}=${pg.perLesson})`);

// the two labelled headers exist in the DOM, in order, with lists under both
// (header = S.perLessonLabel "Темы: …" + " · " + track group label)
const headers = await page.evaluate(() =>
  Array.from(document.querySelectorAll(".sec-label")).map((e) => e.textContent).filter((t) => t && t.includes("Темы")),
);
console.log("  per-lesson headers: " + JSON.stringify(headers));
assert(headers.length === 2, "exactly two per-lesson track headers rendered");
assert(headers[0].includes("C#") && headers[1].includes("Python"), "headers name the tracks (C# first, Python second)");
const listCounts = await page.evaluate(() => Array.from(document.querySelectorAll(".lesson-list")).map((l) => l.querySelectorAll("[data-lesson]").length));
assert(listCounts.length === 2 && listCounts.every((n) => n > 0), `two lesson lists rendered, both non-empty (${JSON.stringify(listCounts)})`);

// screenshots: full page + the per-lesson boundary between the two groups
await page.screenshot({ path: `${EV}/390-progress-tracks-full.png`, fullPage: true });
await page.evaluate(() => {
  const labels = Array.from(document.querySelectorAll(".sec-label")).filter((e) => e.textContent && e.textContent.includes("Темы"));
  if (labels[1]) labels[1].scrollIntoView({ block: "center" });
});
await sleep(300);
await page.screenshot({ path: `${EV}/390-progress-tracks-boundary.png` });

assert(errors.length === 0, `zero console errors (${errors.length})`);
console.log(failed === 0 ? "==== ALL GREEN · runUser=" + RUN_USER + " ====" : "==== " + failed + " FAILED ====");
await browser.close();
process.exit(failed === 0 ? 0 : 1);
