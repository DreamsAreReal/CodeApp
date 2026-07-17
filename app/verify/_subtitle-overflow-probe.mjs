/**
 * Executable proof for the 390px home subtitles fix: for every card in the
 * python track list, report whether the .t-sub line overflows (ellipsis active:
 * scrollWidth > clientWidth). Expect 0 overflows after the fix.
 */
import { chromium } from "playwright";

const APP = "http://localhost:4173";
const RUN_USER = 940000 + Math.floor(Math.random() * 9000);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await ctx.addInitScript((uid) => { try { localStorage.setItem("codex.devUserId", String(uid)); } catch (e) { void e; } }, RUN_USER);
const page = await ctx.newPage();
await page.goto(APP, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__app && window.__app.ready, { timeout: 15000 });
await page.click('[data-track-tab="python"]');
await page.waitForTimeout(500);

const rows = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('[data-track-path="python"] .topic').forEach((t) => {
    const sub = t.querySelector(".t-sub");
    if (!sub) return;
    out.push({
      lesson: t.getAttribute("data-lesson"),
      text: sub.textContent,
      overflow: sub.scrollWidth > sub.clientWidth,
      scrollWidth: sub.scrollWidth,
      clientWidth: sub.clientWidth,
    });
  });
  return out;
});

let bad = 0;
for (const r of rows) {
  if (r.overflow) bad++;
  console.log(`${r.overflow ? "OVERFLOW" : "fits    "} ${r.lesson}  [${r.scrollWidth}/${r.clientWidth}]  "${r.text}"`);
}
console.log(bad === 0 ? `ALL FIT (${rows.length} cards)` : `${bad} OVERFLOWING of ${rows.length}`);
await browser.close();
process.exit(bad === 0 ? 0 : 1);
