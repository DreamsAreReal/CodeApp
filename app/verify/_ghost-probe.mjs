import { chromium } from "playwright";
const APP = "http://localhost:4173";
for (const reduced of [false, true]) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: reduced ? "reduce" : "no-preference" });
  await ctx.addInitScript(() => { try { localStorage.setItem("codex.devUserId", "912345"); } catch (e) { void e; } });
  const page = await ctx.newPage();
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__app && window.__app.ready, { timeout: 15000 });
  await page.evaluate(() => window.__app.openLesson("PY.M12.strings-flow"));
  await page.waitForFunction(() => window.__viz && window.__viz.ready, { timeout: 15000 });
  await page.evaluate(() => window.__viz.forcePlayAll());
  await page.waitForTimeout(1200);
  const res = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll(".node.ghost").forEach((el) => {
      const seg = el.closest("[data-seg]")?.getAttribute("data-seg");
      out.push({ seg, cls: el.getAttribute("class"), op: getComputedStyle(el).opacity });
    });
    return out;
  });
  console.log(reduced ? "REDUCED" : "NORMAL", JSON.stringify(res));
  await browser.close();
}
