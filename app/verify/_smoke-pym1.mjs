// Smoke: headless open of PY.M1 — lesson renders, all 8 segments build, 0 console errors.
import { chromium } from "playwright";
const APP = "http://localhost:4173";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript(() => { try { localStorage.setItem("codex.devUserId", "919001"); } catch (e) { void e; } });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(APP, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__app && window.__app.ready, { timeout: 15000 });
await page.evaluate(() => window.__app.openLesson("PY.M1.names-objects"));
await page.waitForFunction(() => window.__viz && window.__viz.ready && window.__lesson.id === "PY.M1.names-objects", { timeout: 15000 });
const segs = await page.$$eval("[data-seg]", (els) => els.length);
console.log(`PY.M1 opened: segments=${segs} consoleErrors=${errors.length}`);
if (segs < 8 || errors.length) { console.log("ERRORS:", errors.slice(0, 5)); process.exit(1); }
console.log("SMOKE PY.M1 GREEN");
await browser.close();
