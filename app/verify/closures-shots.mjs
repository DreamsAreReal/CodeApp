/**
 * Evidence capture for the auto-layout v2 migration of the closures lesson:
 * reduced-motion (static final-frame) 390px element-screenshots of ALL 5
 * segments, written into docs/evidence/autolayout/closures/.
 *
 * Usage: node verify/closures-shots.mjs
 * Requires backend :5080 + preview :4173 (same as viz-fit.mjs).
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const APP = process.env.APP_BASE || "http://localhost:4173";
const API = process.env.VITE_API_BASE || "http://localhost:5080";
const EV = "/Users/admin/Desktop/test5/docs/evidence/autolayout/closures";
const RUN_USER = 760000 + Math.floor(Math.random() * 90000);
const LESSON = "T2.M2.closures";
const SEGS = [
  { seg: 0, file: "s1-capture" },
  { seg: 1, file: "s2-displayclass-nested" },
  { seg: 2, file: "s3-shared-cell" },
  { seg: 3, file: "s4-lifetime" },
  { seg: 4, file: "s5-for-vs-foreach" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  mkdirSync(EV, { recursive: true });
  await fetch(API + "/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ devUserId: RUN_USER }),
  });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
  await ctx.addInitScript((uid) => {
    try {
      localStorage.setItem("codex.devUserId", String(uid));
    } catch (e) {
      void e;
    }
  }, RUN_USER);
  const page = await ctx.newPage();
  await page.goto(APP, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__app && window.__app.ready, { timeout: 15000 });

  let ready = false;
  for (let a = 0; a < 40 && !ready; a++) {
    await page.evaluate((lid) => window.__app.openLesson(lid), LESSON);
    await sleep(120);
    ready = await page.evaluate((lid) => !!window.__viz && window.__viz.ready === true && !!window.__lesson && window.__lesson.id === lid, LESSON);
  }
  if (!ready) {
    console.error("NOT READY", LESSON);
    process.exit(1);
  }
  await sleep(300);

  let n = 0;
  const stages = await page.$$(".stage");
  for (const s of SEGS) {
    const h = stages[s.seg];
    if (h) {
      await h.scrollIntoViewIfNeeded();
      await sleep(120);
      await h.screenshot({ path: `${EV}/${s.file}.png` });
      n++;
      console.log("shot", `${EV}/${s.file}.png`);
    }
  }
  await browser.close();
  console.log(`\n${n} screenshots -> ${EV}`);
  process.exit(n === SEGS.length ? 0 : 1);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
