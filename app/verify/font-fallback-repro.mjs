/**
 * REPRODUCE the root cause of the CI `viz-fit` failure (green on macOS, red on Linux)
 * and the offline-first breakage — BEFORE the self-host fix.
 *
 * Cause (confirmed here): the app loads Rubik / Onest / JetBrains Mono from the Google
 * Fonts CDN and measures text (engine `domMeasure` → `sizeNode` / `layoutScene`) WITHOUT
 * awaiting `document.fonts.ready`. Box widths and layout positions are therefore derived
 * from whatever font is resolved AT MEASURE TIME:
 *   · with the web font present  → real Rubik metrics;
 *   · with it absent (offline, or a Linux runner that has no Rubik) → the SYSTEM FALLBACK,
 *     whose glyph advances differ. `sizeNode` then snaps to a DIFFERENT ladder rung and
 *     `layoutScene` places boxes at DIFFERENT coordinates.
 *
 * That metric-driven divergence is exactly what makes viz-fit's geometry assertions
 * (FIT / WIDTH-ON-LADDER / OVERLAP) pass on one platform and fail on another: the boxes
 * are literally sized/placed differently depending on which font measured them.
 *
 * PROOF STRATEGY (deterministic, platform-independent): open the SAME lessons twice —
 * once with the font CDN reachable (real Rubik) and once with fonts.googleapis.com /
 * fonts.gstatic.com BLOCKED (route.abort → system fallback, the Linux/offline condition)
 * — and DIFF the resulting box widths. A non-zero diff proves geometry depends on the
 * font being loaded, i.e. an unawaited-font race that breaks viz-fit off the mac.
 *
 *   diffs > 0  →  CAUSE CONFIRMED  (box geometry changes when Rubik is absent)  → exit 2
 *   diffs == 0 →  no font dependency (post-fix: self-hosted + awaited)          → exit 0
 *
 * Run: node verify/font-fallback-repro.mjs   (needs backend :5080 + preview :4173)
 */
import { chromium } from "playwright";
import { preflight } from "./_util.mjs";

const APP = process.env.APP_BASE || "http://localhost:4173";
const API = process.env.VITE_API_BASE || "http://localhost:5080";
const RUN_USER = 610000 + Math.floor(Math.random() * 90000);

const LESSONS = ["T1.M2.value-vs-reference", "T1.M3.boxing", "T1.M4.gc", "T2.M2.closures", "T2.M1.async-await", "T2.M5.hashtable"];

const log = (m) => console.log(m);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Open every lesson, settle to final frames, and return a map of node-box widths. */
async function boxGeometry(browser, blockFonts) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await ctx.addInitScript((uid) => {
    try { localStorage.setItem("codex.devUserId", String(uid)); } catch (e) { void e; }
  }, RUN_USER);
  let aborted = 0;
  if (blockFonts) {
    // The offline / Linux-CI condition: the web-font CDN is unreachable.
    const abortFont = (route) => { aborted++; return route.abort(); };
    await ctx.route("**://fonts.googleapis.com/**", abortFont);
    await ctx.route("**://fonts.gstatic.com/**", abortFont);
  }
  const page = await ctx.newPage();
  await page.goto(APP, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.__app && window.__app.ready, { timeout: 20000 });
  if (!blockFonts) await page.evaluate(() => document.fonts.ready); // let real Rubik land first
  const widths = {};
  for (const id of LESSONS) {
    let ready = false;
    for (let a = 0; a < 40 && !ready; a++) {
      await page.evaluate((x) => window.__app.openLesson(x), id);
      await sleep(120);
      ready = await page.evaluate((x) => !!window.__viz && window.__viz.ready && !!window.__lesson && window.__lesson.id === x, id);
    }
    if (!ready) continue;
    await page.evaluate(() => window.__viz.forcePlayAll());
    await sleep(1300);
    const rows = await page.evaluate((lid) => {
      const out = {};
      document.querySelectorAll(".stage").forEach((st, si) => {
        st.querySelectorAll("g.node").forEach((g) => {
          const r = g.querySelector("rect");
          if (r) out[`${lid}|s${si}|${g.getAttribute("data-node") || "?"}`] = parseFloat(r.getAttribute("width") || "0");
        });
      });
      return out;
    }, id);
    Object.assign(widths, rows);
  }
  const rubikLoaded = await page.evaluate(() => {
    // measure the same string in the CSS --display stack vs an explicit Rubik request;
    // when Rubik is loaded these agree, else the stack silently falls back.
    const c = document.createElement("canvas").getContext("2d");
    const disp = getComputedStyle(document.documentElement).getPropertyValue("--display").trim() || "sans-serif";
    c.font = `700 40px ${disp}`;
    const a = c.measureText("Boxing123 привет мир").width;
    return { fontFaces: [...document.fonts].filter((f) => f.status === "loaded").length, sample: Math.round(a) };
  });
  await ctx.close();
  return { widths, aborted, rubikLoaded };
}

async function main() {
  await preflight();
  await fetch(API + "/api/auth", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ devUserId: RUN_USER }),
  });
  const browser = await chromium.launch();

  log("== A) fonts LOADED (CDN reachable — the mac-green condition) ==");
  const withFonts = await boxGeometry(browser, false);
  log(`   loaded font faces: ${withFonts.rubikLoaded.fontFaces}, sample advance=${withFonts.rubikLoaded.sample}px, boxes=${Object.keys(withFonts.widths).length}`);

  log("\n== B) fonts BLOCKED (Rubik absent — the Linux-CI / offline condition) ==");
  const noFonts = await boxGeometry(browser, true);
  log(`   font requests aborted: ${noFonts.aborted}, loaded font faces: ${noFonts.rubikLoaded.fontFaces}, sample advance=${noFonts.rubikLoaded.sample}px, boxes=${Object.keys(noFonts.widths).length}`);

  await browser.close();

  // DIFF the box widths between the two font conditions.
  const keys = Object.keys(withFonts.widths);
  let diffs = 0;
  log("\n== box-width divergence (Rubik metrics vs fallback metrics) ==");
  for (const k of keys) {
    const a = withFonts.widths[k];
    const b = noFonts.widths[k];
    if (b !== undefined && a !== b) {
      diffs++;
      log(`   · ${k}: withRubik=${a}  fallback=${b}  Δ=${a - b}`);
    }
  }
  const sampleGap = withFonts.rubikLoaded.sample - noFonts.rubikLoaded.sample;
  log(`\n   glyph-advance gap on a sample line: Rubik ${withFonts.rubikLoaded.sample}px vs fallback ${noFonts.rubikLoaded.sample}px (Δ=${sampleGap}px)`);
  log(`\n==== FONT-FALLBACK REPRO: ${diffs} node boxes change width when Rubik is absent ====`);
  if (diffs > 0 || sampleGap !== 0) {
    log("==== CAUSE CONFIRMED: box geometry is font-metric-dependent and fonts are NOT awaited before");
    log("     measuring — so a runner without Rubik (Linux CI / offline) sizes/places boxes differently,");
    log("     which is what flips viz-fit's FIT/WIDTH/OVERLAP assertions from green (mac) to red (CI). ====");
    process.exit(2);
  }
  log("==== No geometry divergence — fonts are self-hosted + awaited (post-fix). ====");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
