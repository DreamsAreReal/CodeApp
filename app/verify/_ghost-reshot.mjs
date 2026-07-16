// One-off reshoot: PY.M7 s4 + PY.M12 s3 reduced-motion finals after the ghost-opacity fix.
import { chromium } from "playwright";
const APP = process.env.APP_BASE || "http://localhost:4173";
const EV = "/Users/admin/Desktop/CodeApp/docs/tasks/python-track/evidence/M3-fixes";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
await ctx.addInitScript(() => { try { localStorage.setItem("codex.devUserId", "913377"); } catch (e) { void e; } });
const page = await ctx.newPage();
await page.goto(APP, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__app && window.__app.ready, { timeout: 15000 });
for (const [id, seg] of [["PY.M7.context-managers", "s4"], ["PY.M12.strings-flow", "s3"]]) {
  await page.evaluate((l) => window.__app.openLesson(l), id);
  await page.waitForFunction(() => window.__viz && window.__viz.ready, { timeout: 15000 });
  await page.evaluate(() => window.__viz.forcePlayAll());
  await page.waitForTimeout(800);
  const el = page.locator(`[data-seg="${seg}"]`);
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await el.screenshot({ path: `${EV}/390-${id.split(".")[1]}-${seg}-reduced.png` });
}
await browser.close();
console.log("DONE ->", EV);
