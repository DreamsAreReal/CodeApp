/**
 * Evidence capture for the viz redesign: reduced-motion (static final-frame),
 * 390px element-screenshots of async-await's 5 segments + one scene each of
 * gc / hashtable / closures, written into docs/evidence/viz-redesign/<tag>/.
 *
 * Usage: node verify/viz-shots.mjs <tag>   (tag = "before" | "after")
 * Requires backend :5080 + preview :4173 (same as viz-fit.mjs).
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { evidenceDir } from "./_util.mjs";

const APP = process.env.APP_BASE || "http://localhost:4173";
const API = process.env.VITE_API_BASE || "http://localhost:5080";
const TAG = process.argv[2] || "after";
// CI-portable evidence dir (no hardcoded path): $EVIDENCE_DIR/viz-redesign/<tag> on CI, else repo-relative.
const EV = evidenceDir(`viz-redesign/${TAG}`);
const RUN_USER = 780000 + Math.floor(Math.random() * 90000);

const SHOTS = {
  "T2.M1.async-await": [0, 1, 2, 3, 4].map((i) => ({ seg: i, file: `async-await-s${i + 1}` })),
  "T1.M4.gc": [{ seg: 4, file: "gc-s5-phases" }],
  "T2.M5.hashtable": [{ seg: 1, file: "hashtable-s2-collision" }],
  "T2.M2.closures": [{ seg: 1, file: "closures-s2-displayclass" }],
};
const LESSONS = Object.keys(SHOTS);

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

  let n = 0;
  for (const id of LESSONS) {
    let ready = false;
    for (let a = 0; a < 40 && !ready; a++) {
      await page.evaluate((lid) => window.__app.openLesson(lid), id);
      await sleep(120);
      ready = await page.evaluate((lid) => !!window.__viz && window.__viz.ready === true && !!window.__lesson && window.__lesson.id === lid, id);
    }
    if (!ready) {
      console.log("NOT READY", id);
      continue;
    }
    await sleep(250);
    const stages = await page.$$(".stage");
    for (const s of SHOTS[id]) {
      const h = stages[s.seg];
      if (h) {
        await h.scrollIntoViewIfNeeded();
        await sleep(80);
        await h.screenshot({ path: `${EV}/${s.file}.png` });
        n++;
        console.log("shot", `${EV}/${s.file}.png`);
      }
    }
  }
  await browser.close();
  console.log(`\n${n} screenshots -> ${EV}`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
