import { chromium } from "playwright";
const APP = "http://localhost:4173";
const OUT = "../docs/reviews/evidence/M2-python";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript(() => { try { localStorage.setItem("codex.devUserId", "812345"); } catch (e) { void e; } });
const page = await ctx.newPage();
await page.goto(APP, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__app?.ready && window.__home, { timeout: 15000 });
await page.click('[data-track-tab="python"]');
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: `${OUT}/eval-390-home-python-switcher.png`, fullPage: true });
await page.emulateMedia({ reducedMotion: "reduce" });
for (const [id, seg, name] of [["PY.M5.decorators", "s8", "eval-390-m5-s8-dis.png"], ["PY.M6.generators", "s2", "eval-390-m6-s2-frame.png"], ["PY.M2.collections-hash", "s1", "eval-390-m2-s1-buckets.png"]]) {
  await page.evaluate((l) => window.__app.openLesson(l), id);
  await page.waitForFunction(() => window.__viz?.ready, { timeout: 15000 });
  await page.evaluate((s) => document.querySelector(`[data-seg="${s}"]`)?.scrollIntoView(), seg);
  await new Promise(r => setTimeout(r, 800));
  const el = await page.locator(`[data-seg="${seg}"]`);
  await el.screenshot({ path: `${OUT}/${name}` });
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__app?.ready && window.__home, { timeout: 15000 });
}
await browser.close();
console.log("shots done");
