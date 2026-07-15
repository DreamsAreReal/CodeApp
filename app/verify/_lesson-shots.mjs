/** Generic lesson evidence shots: node verify/_lesson-shots.mjs <lessonId> <evidenceDir> <segCount> */
import { chromium } from "playwright";
const [, , LESSON, EVDIR, SEGS] = process.argv;
const APP = "http://localhost:4173";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.addInitScript(() => { try { localStorage.setItem("codex.devUserId", "927555"); } catch (e) { void e; } });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(APP, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__app && window.__app.ready, { timeout: 15000 });
await page.evaluate((id) => window.__app.openLesson(id), LESSON);
await page.waitForFunction(() => window.__viz && window.__viz.ready, { timeout: 15000 });
const ids = Array.from({ length: Number(SEGS) }, (_, i) => `s${i + 1}`);
for (const id of ids) {
  await page.locator(`[data-seg="${id}"]`).scrollIntoViewIfNeeded();
  await sleep(350);
}
await page.evaluate(() => window.__viz.forcePlayAll());
await sleep(600);
for (const id of ids) {
  const el = page.locator(`[data-seg="${id}"]`);
  await el.scrollIntoViewIfNeeded();
  await page.evaluate((segId) => {
    const seg = document.querySelector(`[data-seg="${segId}"]`);
    const bar = document.querySelector(".lbar");
    const barBottom = bar ? bar.getBoundingClientRect().bottom : 0;
    const top = seg.getBoundingClientRect().top;
    if (top < barBottom + 6) window.scrollBy(0, top - barBottom - 6);
  }, id);
  await sleep(250);
  await el.screenshot({ path: `${EVDIR}/390-seg-${id}-final.png` });
}
await page.locator("#mcqCard").scrollIntoViewIfNeeded();
await sleep(300);
await page.locator("#mcqCard").screenshot({ path: `${EVDIR}/390-card.png` });
console.log("console errors:", errors.length, errors.slice(0, 5));
await browser.close();
console.log("DONE ->", EVDIR);
