/**
 * Final-verify fix tact: before/after evidence shots (390x844).
 *   node verify/_final-fix-shots.mjs before|after
 * Frames: home python list (subtitles + track sub), multiline-console frames
 * (PY.M12 s1, PY.M9 s3, PY.M11 s7), PY.M2 source card, C# boxing s2 baseline.
 * Output: docs/tasks/python-track/evidence/final-fixes/<tag>-*.png
 */
import { chromium } from "playwright";

const TAG = process.argv[2] === "after" ? "after" : "before";
const APP = "http://localhost:4173";
const EV = "/Users/admin/Desktop/CodeApp/docs/tasks/python-track/evidence/final-fixes";
const RUN_USER = 930000 + Math.floor(Math.random() * 9000);
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

// home: python track list (subtitles + section sub)
const pyChip = page.locator('[data-track-tab="python"]').first();
if (await pyChip.count()) { await pyChip.click(); await sleep(500); }
await page.screenshot({ path: `${EV}/${TAG}-home-python.png`, fullPage: true });

async function segShot(lessonId, segId, name) {
  await page.evaluate((lid) => window.__app.openLesson(lid), lessonId);
  await page.waitForFunction((lid) => window.__viz && window.__viz.ready && window.__lesson.id === lid, lessonId, { timeout: 15000 });
  const el = page.locator(`[data-seg="${segId}"]`);
  await el.scrollIntoViewIfNeeded();
  await sleep(500);
  // Force the final frame AFTER scrolling: scroll-into-view restarts autoplay,
  // and we need the last scene (multiline console) on the shot.
  await page.evaluate(() => window.__viz.forcePlayAll());
  await sleep(700);
  await el.screenshot({ path: `${EV}/${TAG}-${name}.png` });
}

await segShot("PY.M12.strings-flow", "s1", "str-s1");
await segShot("PY.M9.exceptions", "s3", "exc-s3");
await segShot("PY.M11.async-await", "s7", "async-s7");
await segShot("T1.M3.boxing", "s2", "boxing-s2");

// PY.M2 source card (org attribution)
await page.evaluate(() => window.__app.openLesson("PY.M2.collections-hash"));
await page.waitForFunction(() => window.__viz && window.__viz.ready && window.__lesson.id === "PY.M2.collections-hash", { timeout: 15000 });
const src = page.locator(".src").first();
await src.scrollIntoViewIfNeeded();
await sleep(300);
await src.screenshot({ path: `${EV}/${TAG}-pym2-source.png` });

console.log(`${TAG} shots done; console errors:`, errors.length, errors.slice(0, 5));
await browser.close();
