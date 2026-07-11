/**
 * Evidence capture for the auto-layout v2 migration of the remaining lessons.
 * Reduced-motion (static final-frame) 390px element-screenshots of EVERY segment
 * of the five migrated lessons, written into docs/evidence/autolayout/<lesson>/.
 *
 * Usage:
 *   node verify/autolayout-shots.mjs            # all migrated lessons
 *   node verify/autolayout-shots.mjs value-vs-reference boxing   # a subset (by slug)
 *
 * Requires backend :5080 + preview :4173 (same as viz-fit.mjs). Preview must be
 * serving a FRESH build — vite preview caches the bundle, so restart it after a
 * lesson edit before running this.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const APP = process.env.APP_BASE || "http://localhost:4173";
const API = process.env.VITE_API_BASE || "http://localhost:5080";
const ROOT = "/Users/admin/Desktop/test5/docs/evidence/autolayout";
const RUN_USER = 770000 + Math.floor(Math.random() * 90000);

// slug -> { id, dir, segs }
const LESSONS = {
  "value-vs-reference": { id: "T1.M2.value-vs-reference", dir: "value-vs-reference", segs: 4 },
  boxing: { id: "T1.M3.boxing", dir: "boxing", segs: 7 },
  gc: { id: "T1.M4.gc", dir: "gc", segs: 6 },
  hashtable: { id: "T2.M5.hashtable", dir: "hashtable", segs: 6 },
  "async-await": { id: "T2.M1.async-await", dir: "async-await", segs: 5 },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const want = process.argv.slice(2);
  const slugs = want.length ? want : Object.keys(LESSONS);

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

  let total = 0;
  for (const slug of slugs) {
    const L = LESSONS[slug];
    if (!L) {
      console.error("unknown lesson slug:", slug);
      continue;
    }
    const EV = `${ROOT}/${L.dir}`;
    mkdirSync(EV, { recursive: true });
    let ready = false;
    for (let a = 0; a < 40 && !ready; a++) {
      await page.evaluate((lid) => window.__app.openLesson(lid), L.id);
      await sleep(120);
      ready = await page.evaluate((lid) => !!window.__viz && window.__viz.ready === true && !!window.__lesson && window.__lesson.id === lid, L.id);
    }
    if (!ready) {
      console.error("NOT READY", L.id);
      process.exit(1);
    }
    await sleep(300);
    const stages = await page.$$(".stage");
    for (let i = 0; i < L.segs; i++) {
      const h = stages[i];
      if (h) {
        await h.scrollIntoViewIfNeeded();
        await sleep(120);
        const file = `${EV}/s${i + 1}.png`;
        await h.screenshot({ path: file });
        total++;
        console.log("shot", file);
      }
    }
  }
  await browser.close();
  console.log(`\n${total} screenshots -> ${ROOT}/<lesson>`);
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
