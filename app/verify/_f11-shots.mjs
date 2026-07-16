/**
 * F11 evidence screenshots (390×844): every segment of PY.M11.async-await
 * (autoplay frame stopping at predict gates, then forced final frame) + the typed
 * card before/after grading. Writes PNGs to docs/tasks/python-track/evidence/F11.
 */
import { chromium } from "playwright";

const APP = "http://localhost:4173";
const EV = "/Users/admin/Desktop/CodeApp/docs/tasks/python-track/evidence/F11";
const RUN_USER = 970000 + Math.floor(Math.random() * 9000);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

await page.evaluate(() => window.__app.openLesson("PY.M11.async-await"));
await page.waitForFunction(() => window.__viz && window.__viz.ready && window.__lesson.id === "PY.M11.async-await", { timeout: 15000 });
await sleep(300);
await page.screenshot({ path: `${EV}/390-lesson-head-hook.png` });

const segIds = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"];
async function scrollClearOfBar(id) {
  const el = page.locator(`[data-seg="${id}"]`);
  await el.scrollIntoViewIfNeeded();
  await page.evaluate((segId) => {
    const seg = document.querySelector(`[data-seg="${segId}"]`);
    const bar = document.querySelector(".lbar");
    const barBottom = bar ? bar.getBoundingClientRect().bottom : 0;
    const top = seg.getBoundingClientRect().top;
    if (top < barBottom + 6) window.scrollBy(0, top - barBottom - 6);
  }, id);
  return el;
}
// natural autoplay pass first (segments with predict gates stop AT the gate)
for (const id of segIds) {
  const el = await scrollClearOfBar(id);
  await sleep(3800);
  await el.screenshot({ path: `${EV}/390-seg-${id}-autoplay.png` });
}
// then resolve everything to the final frames
await page.evaluate(() => window.__viz.forcePlayAll());
await sleep(600);
for (const id of segIds) {
  const el = await scrollClearOfBar(id);
  await sleep(250);
  await el.screenshot({ path: `${EV}/390-seg-${id}-final.png` });
}

// card: typed answer before/after (c1: coroutine\n42)
await page.locator("#mcqCard").scrollIntoViewIfNeeded();
await sleep(300);
await page.locator("#mcqCard").screenshot({ path: `${EV}/390-card-before.png` });
await page.fill("#qTyped", "coroutine\n42");
await page.click("#qCheck");
await page.waitForSelector("#qVerdict", { state: "visible", timeout: 8000 });
await sleep(300);
await page.locator("#mcqCard").screenshot({ path: `${EV}/390-card-after.png` });

console.log("console errors:", errors.length, errors.slice(0, 5));
await browser.close();
console.log("DONE ->", EV);
