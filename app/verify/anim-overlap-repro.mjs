/**
 * REPRO (task 1): prove the mid-transition overlap the settled-frame harness misses.
 *
 * Against the LIVE stack (backend :5080 + preview :4173), opens a lesson and, for
 * EVERY segment, drives the REAL scene-to-scene transition with `goTo(i)` (NO force,
 * so enter/exit/FLIP actually run), sampling node-box geometry at ~30% and ~60% of
 * the transition window (mid-FLIP). It reports every pair of NON-NESTED node boxes
 * that visibly overlap during the move, and screenshots the offending frame into
 * docs/evidence/anim-overlap-before/.
 *
 * Usage: node verify/anim-overlap-repro.mjs [lessonId]   (default T1.M3.boxing)
 */
import { chromium } from "playwright";
import { evidenceDir, preflight } from "./_util.mjs";
import { PROBE_SRC } from "./_anim-overlap-probe.mjs";

const APP = process.env.APP_BASE || "http://localhost:4173";
const EV = evidenceDir("anim-overlap-before");
const RUN_USER = 610000 + Math.floor(Math.random() * 90000);
const LESSON = process.argv[2] || "T1.M3.boxing";
const OVL_TOL = 2; // user units: crossings ≤2u are "just touching", not overlap
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (m) => console.log(m);

// Staged transition spans exit(0-200) → move(200-580) → enter(560-820). Sample densely
// across the WHOLE window so no stage's mid-point (a same-cell swap, a still-fading exit,
// a not-yet-landed mover) can slip between samples.
const SAMPLE_MS = [40, 60, 90, 120, 160, 190, 220, 250, 310, 370, 400, 480, 560, 640, 720, 820];

async function main() {
  await preflight();
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
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
  for (let attempt = 0; attempt < 40 && !ready; attempt++) {
    await page.evaluate((id) => window.__app.openLesson(id), LESSON);
    await sleep(120);
    ready = await page.evaluate(
      (id) => !!window.__viz && window.__viz.ready === true && !!window.__lesson && window.__lesson.id === id,
      LESSON,
    );
  }
  if (!ready) {
    log("  ✗ lesson not ready");
    process.exit(1);
  }

  const segKeys = await page.evaluate(() => Object.keys(window.__viz.vizByKey));
  log(`\n== REPRO ${LESSON}: ${segKeys.length} segments, mid-transition overlap probe ==`);

  const findings = [];
  for (let si = 0; si < segKeys.length; si++) {
    const segKey = segKeys[si];
    const total = await page.evaluate((k) => window.__viz.vizByKey[k].total, segKey);
    // Reset this segment to frame 0 instantly (force so we start clean), settle.
    await page.evaluate((k) => window.__viz.vizByKey[k].goTo(0, { force: true }), segKey);
    await sleep(700);
    for (let i = 1; i < total; i++) {
      // Kick off the REAL animated transition to frame i (no force ⇒ enter/exit/FLIP run).
      await page.evaluate(([k, idx]) => window.__viz.vizByKey[k].goTo(idx, { force: true }), [segKey, i]);
      for (let s = 0; s < SAMPLE_MS.length; s++) {
        // Wait until this sample offset from the transition start.
        const prev = s === 0 ? 0 : SAMPLE_MS[s - 1];
        await sleep(SAMPLE_MS[s] - prev);
        const res = await page.evaluate(([src, idx, tol]) => eval(src)(idx, tol), [PROBE_SRC, si, OVL_TOL]);
        if (res.clips && res.clips.length) {
          for (const c of res.clips) {
            findings.push({ seg: si + 1, segKey, transition: `${i - 1}→${i}`, at: `${SAMPLE_MS[s]}ms`, clip: c });
            log(`  ✗ CLIP seg${si + 1} (${segKey}) ${i - 1}→${i} @${SAMPLE_MS[s]}ms: ${c.id} box=[${c.box}] vb=[${c.vb}]`);
          }
        }
        if (res.overlaps && res.overlaps.length) {
          const stage = (await page.$$(".stage"))[si];
          const file = `${LESSON.replace(/\W+/g, "_")}-s${si + 1}-to${i}-t${SAMPLE_MS[s]}ms.png`;
          if (stage) {
            await stage.scrollIntoViewIfNeeded();
            await stage.screenshot({ path: `${EV}/${file}` });
          }
          for (const o of res.overlaps) {
            const rec = { seg: si + 1, segKey, transition: `${i - 1}→${i}`, at: `${SAMPLE_MS[s]}ms`, ...o, shot: file };
            findings.push(rec);
            log(
              `  ✗ OVERLAP seg${si + 1} (${segKey}) ${i - 1}→${i} @${SAMPLE_MS[s]}ms: ` +
                `${o.a} ∩ ${o.b} = [${o.over}]u  (opA=${o.opA} opB=${o.opB})  → ${file}`,
            );
          }
        }
      }
      // let the transition fully finish + settle before starting the next one
      await sleep(220);
    }
  }

  log(`\n== ${findings.length} mid-transition overlap findings; before-frames in docs/evidence/anim-overlap-before/ ==`);
  await browser.close();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
