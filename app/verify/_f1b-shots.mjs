/**
 * F1b evidence screenshots (390×844): the track switcher (both tracks), the choice
 * SURVIVING a reload, last-opened-lesson default, and the polished PY.M1 frames
 * (s1 extra scene, s6 rewording, s7 under the sticky-bar hairline).
 * Writes PNGs to docs/tasks/python-track/evidence/F1b.
 */
import { chromium } from "playwright";

const APP = "http://localhost:4173";
const EV = "/Users/admin/Desktop/CodeApp/docs/tasks/python-track/evidence/F1b";
const RUN_USER = 940000 + Math.floor(Math.random() * 9000);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.addInitScript((uid) => { try { localStorage.setItem("codex.devUserId", String(uid)); } catch (e) { void e; } }, RUN_USER);
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));

const waitHome = async () => {
  await page.waitForFunction(() => window.__app && window.__app.ready, { timeout: 15000 });
  await page.waitForFunction(() => window.__home && typeof window.__home.userId === "number", { timeout: 15000 });
};

await page.goto(APP, { waitUntil: "networkidle" });
await waitHome();

// 1) default = first group (csharp): chips + C# path
await page.locator(".track-tabs").scrollIntoViewIfNeeded();
await sleep(300);
await page.screenshot({ path: `${EV}/390-switcher-csharp.png`, fullPage: true });
console.log("activeTrack (default):", await page.evaluate(() => window.__home.activeTrack));

// 2) tap the Python chip: path swaps to the PY lessons
await page.click('[data-track-tab="python"]');
await sleep(400);
await page.screenshot({ path: `${EV}/390-switcher-python.png`, fullPage: true });
console.log("activeTrack (after tap):", await page.evaluate(() => window.__home.activeTrack));

// 3) the choice survives a RELOAD (localStorage persistence)
await page.reload({ waitUntil: "networkidle" });
await waitHome();
await sleep(300);
const persisted = await page.evaluate(() => window.__home.activeTrack);
console.log("activeTrack (after reload):", persisted);
await page.screenshot({ path: `${EV}/390-switcher-python-after-reload.png`, fullPage: true });
if (persisted !== "python") { console.log("PERSIST FAIL"); process.exit(1); }

// 4) last-opened lesson wins: open a C# lesson, go home -> csharp is active again
await page.evaluate(() => window.__app.openLesson("T1.M3.boxing"));
await page.waitForFunction(() => window.__viz && window.__viz.ready, { timeout: 15000 });
await page.click("#btnClose");
await waitHome();
await sleep(300);
const afterLesson = await page.evaluate(() => window.__home.activeTrack);
console.log("activeTrack (after opening a C# lesson):", afterLesson);
if (afterLesson !== "csharp") { console.log("LAST-OPENED FAIL"); process.exit(1); }
await page.screenshot({ path: `${EV}/390-switcher-last-opened-csharp.png`, fullPage: true });

// 5) polished lesson frames: s1 (new 4th scene), s6 (rewording), s7 (hairline seam), s8 (typeTag refs)
await page.evaluate(() => window.__app.openLesson("PY.M1.names-objects"));
await page.waitForFunction(() => window.__viz && window.__viz.ready, { timeout: 15000 });
// visit every segment FIRST (their IntersectionObserver autoplay fires once), THEN force
// the final frames — otherwise scrolling after forcePlayAll would restart the animations.
for (const id of ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"]) {
  await page.locator(`[data-seg="${id}"]`).scrollIntoViewIfNeeded();
  await sleep(350);
}
await page.evaluate(() => window.__viz.forcePlayAll());
await sleep(600);
for (const id of ["s1", "s2", "s4", "s6", "s7", "s8"]) {
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
  await el.screenshot({ path: `${EV}/390-seg-${id}-final.png` });
}
// s7 mid-scroll viewport frame: the first code line sliding under the bar's hairline seam
await page.evaluate(() => {
  const seg = document.querySelector('[data-seg="s7"]');
  const bar = document.querySelector(".lbar");
  const barBottom = bar ? bar.getBoundingClientRect().bottom : 0;
  const line = seg.querySelector(".cl-line");
  const r = line.getBoundingClientRect();
  window.scrollBy(0, r.top - barBottom + r.height / 2); // half the line under the bar edge
});
await sleep(250);
await page.screenshot({ path: `${EV}/390-s7-under-bar-seam.png` });

console.log("console errors:", errors.length, errors.slice(0, 5));
await browser.close();
console.log("DONE ->", EV);
